const router = require('express').Router();
const jwt = require('jsonwebtoken');
var passport = require('passport');
const User = require('../models').User;
const Role = require('../models').Role;
const config = require('../config/config');

const request = require('request');
const uuidv1 = require('uuid/v1');

const passwordResetDetails = {
    apiUrl: 'https://api.postageapp.com/v.1.0/send_message.json',
    api_key: "XJ8a34kfvEJhgkpbjm2flVHHEjbjAjmh",
    emailTemplate: "password-reset-mail",
};

router.get('/check-token', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.send({ success: true, user: req.user });
});

router.get('/:id?', async function (req, res, next) {
    const query = {};
    if (req.query && req.query.email) {
        query.where = query.where || {};
        query.where.email = req.query.email
        User.findAndCountAll(query).then((users) => {
            if (users.count == 0) {
                return res.json({ emailTaken: false });
            }
            return res.json({ emailTaken: true });
        }).catch(next)
    }
    else {
        query.where = query.where || {};
        query.where.username = req.query.username
        User.findAndCountAll(query).then((users) => {
            if (users.count == 0) {
                return res.json({ usernameTaken: false });
            }
            return res.json({ usernameTaken: true });
        }).catch(next)
    }
});

/* Login user. */
router.post('/login', function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Role, through: {
                    attributes: []
                },
            }
        ],
        where: {
            $or: [
                {
                    username: req.body.user
                },
                {
                    email: req.body.user
                }
            ]
        }, raw: false
    }).then((user) => {
        if (!user)
            return next(new Error('invalid_email'));
        if (!user.isValidPassword(req.body.password))
            return next(new Error('invalid_password'));
        let expiresIn = req.body.rememberMe ? '15d' : '1d';
        let token = jwt.sign({
            userId: user.userId,
            email: user.email.toLowerCase(),
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.roles
        }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
        res.json({
            success: true,
            token: token
        });
    }).catch(next)
});

// Password Reset mail
router.delete('/:email', async function (req, res, next) {

    const query = {};
    let url = req.headers.origin + "/login/resetpassword/";

    query.where = { email: req.params.email };

    User.findOne(query).then((users) => {


        let token = jwt.sign({
            data: users
        }, config.jwt.secret, { expiresIn: 60 * 60 });

        let uuid = uuidv1();

        request.post({
            headers: { 'content-type': 'application/json' },
            url: `${passwordResetDetails.apiUrl}`,
            json: {
                "api_key": `${passwordResetDetails.api_key}`,
                "uid": `${uuid}`,
                "arguments": {
                    "recipients": [`${users.dataValues.email}`],
                    "headers": {
                        "subject": "APT: Password Reset Request"
                    },
                    "template": `${passwordResetDetails.emailTemplate}`,
                    "variables": {
                        "name": `${users.dataValues.firstName}`,
                        "resetlink": `${url}` + `${token}`
                    }

                }
            }
        }, function (error, response) {
            if (response.body.data.message.status == 'queued') {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        });

    }).catch(next)

});

//reset password
router.patch('/', function (req, res, next) {

    var decoded = jwt.verify(req.body.token, config.jwt.secret);

    let newData = {};
    let query = {};


    if (req.body.password && req.body.password.length)
        newData.password = User.generateHash(req.body.password);

    if (newData.errors)
        return next(newData.errors[0]);

    query.where = { id: decoded.data.id };

    User.update(newData, query).then(() => {

        res.json({ success: true });
    }).catch(next)
});

module.exports = router;
