const router = require('express').Router();
const jwt = require('jsonwebtoken');
var passport = require('passport');
const User = require('../models').User;
const Role = require('../models').Role;
const config = require('../config/config');

router.get('/check-token', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.send({ success: true, user: req.user });
});

router.get('/:id?', async function (req, res, next) {
    User.findAndCountAll({
        where: { userName: req.query.userName }
    }).then((users) => {
        if (users.count == 0) {
            return res.json({ taken: false });
        }
        return res.json({ taken: true });
    }).catch(next)
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
            ],
            status: true
        }
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
            username: user.username,
            role: user.roles
        }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
        res.json({
            success: true,
            token: token
        });
    }).catch(next)
});

module.exports = router;
