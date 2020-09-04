const express = require('express');
const router = express.Router();
var passport = require('passport');
const User = require('../models').User;
const Role = require('../models').Role;
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Twilio = require('../models').Twilio;
var twilio = require('twilio');
var Facility = require('../models').Facility;
const userMeta = require('../models').UserMeta;
/* user registration. */

router.post('/registration', function (req, res, next) {
    let isMfa;
    if (req.body.roleId == 1) {
        isMfa = false;
    } else {
        isMfa = true;
    }
    User.create({
        email: req.body.email,
        password: User.generateHash(req.body.password),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        middleName: req.body.middleName,
        isMFA: isMfa
    }).then((user) => {
        Role.findAll({ where: { roleId: req.body.roleId } }).then((roles) => {
            Promise.resolve(user.setRoles(roles)).then((userRole) => {
                Facility.findOne({ where: { facilityCode: req.body.facilityCode } }).then((facility) => {
                    Promise.resolve(user.addFacility(facility)).then((userFacility) => {
                        res.json({ success: true, data: user })
                    })
                })
            })
        }).catch(next);
    }).catch(next);
});

/*findAll user include role */

router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User.findAll({
        include: [
            {
                model: Role, through: {
                    attributes: []
                },
            }
        ],
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch(next)
})

// single user.

router.get('/user', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Role, through: {
                    attributes: []
                }
            },
            {
                model: userMeta
            }
        ], where: { userId: req.user.userId }
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch(next);
})

/*update Password */

router.put('/password', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let newData = {}
    let query = {};
    User.findOne({ where: { userId: req.user.userId } }).then(curUser => {
        if (!curUser.isValidPassword(req.body.oldPassword)) {
            return res.json({ success: false, data: 'Invalid current password.' })
        } else {
            newData.password = User.generateHash(req.body.password)
        }
        if (newData.errors) {
            return next(newData.errors[0]);
        }
        query.where = { userId: req.user.userId };
        User.update(newData, query).then(() => {
            res.json({ success: true });
        }).catch(next)
    })
});

/*update user */
router.put('/', function (req, res, next) {
    User.update({ status: req.body.value.status }, {
        where: { userName: req.body.value.userName }
    }).then((user) => {
        User.findOne({
            include: [
                {
                    model: Role, through: {
                        attributes: []
                    },
                },
                {
                    model: Facility, through: {
                        attributes: []
                    },
                }
            ],
            where: { userName: req.body.value.userName }
        }).then((user) => {
            let expiresIn = req.body.rememberMe ? '15d' : '1d';
            let token = jwt.sign({
                userId: user.userId,
                userName: user.userName,
                firstName: user.firstName,
                middleName: req.body.middleName,
                lastName: user.lastName,
                role: user.roles,
                facilityCode: user.facilities[0].facilityCode
            }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
            res.json({ success: true, token: token });
        })
    }).catch(next);
})

// myacc User Update

router.put('/updateUser', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    User.update(req.body, {
        where: { userId: req.user.userId }
    }).then(result => {
        res.json({ success: true, data: result });
    }).catch(next);
})

/*update Password */

router.put('/reset-pass', function (req, res, next) {
    let newData = {};
    let query = {};
    User.findOne({
        where: { userName: req.body.userName }
    }).then((user) => {
        if (user.securityQuestionAnswered === 3) {
            if (req.body.password && req.body.password.length) {
                newData.password = User.generateHash(req.body.password);
                newData.securityQuestionAnswered = 0;
            }
            if (newData.errors)
                return next(newData.errors[0]);
            query.where = { userName: req.body.userName }
            User.update(newData, query).then(() => {
                res.json({ success: true, newData });
            }).catch(next)
        }
    })
});

// delete user.

router.delete('/:userId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    if (req.user.role[0].roleId === 7 && req.user.userId !== req.params.userId) {
        User.destroy({
            where: { userId: req.params.userId }
        }).then(() => {
            res.json({ success: true });
        }).catch(next);
    } else {
        res.json({ success: false });
    }
});

// single user.

router.get('/singleUser/:userId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    if (req.user.role[0].roleId === 7) {
        User.findOne({
            include: [
                {
                    model: Role, through: {
                        attributes: []
                    }
                }
            ], where: { userId: req.params.userId }
        }).then((userData) => {
            res.json({ success: true, data: userData });
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

// Update User by userId.

router.put('/updateSingleUser', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.role[0].roleId === 7) {
        User.update(req.body, {
            where: { userId: req.body.userId }
        }).then(result => {
            res.json({ success: true, data: result });
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

// Change Role.

router.put('/changeRole', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.role[0].roleId === 7) {
        User.findOne({
            include: [
                {
                    model: Role, through: {
                        attributes: []
                    }
                }
            ], where: { userId: req.body.userId }
        }).then((userData) => {
            Promise.resolve(userData.setRoles(req.body.roleId)).then((userRole) => {
                res.json({ success: true, data: userData });
            })
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

/**generate otp during registration*/

router.post('/auth/register', async function (req, res, next) {
    let code = generateCode();
    Twilio.findOne({ where: { twilioId: 1 } }).then(twilioCredentials => {
        var client = new twilio(twilioCredentials.accountSid, twilioCredentials.authToken);
        client.messages.create({
            body: 'My Justice Portal' + ': ' + code + ' - This is your verification code.',
            to: '+' + req.body.countryCode + req.body.mobile,  // Text this number
            from: twilioCredentials.from // From a valid Twilio number
        }).then((message) => {
            User.update({ authCode: code, mobile: req.body.mobile, countryCode: req.body.countryCode },
                {
                    where: { userName: req.body.userName }
                }).then(() => {
                    res.json({ success: true })
                }).catch(next)
        }).catch((err) => {
            res.json({ success: false })
        })
    })
});

/**verify otp */

router.post('/register/verify-sms', async function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Role, through: {
                    attributes: []
                }
            }
        ],
        where: { userName: req.body.userName }
    }).then((data) => {
        let date = new Date();
        let x = date - data.dataValues.updatedAt;
        x = Math.round((x / 1000) / 60);
        if (x <= 5 && data.dataValues.authCode == req.body.otp) {
            let expiresIn = req.body.rememberMe ? '15d' : '1d';
            let token = jwt.sign({
                userId: data.dataValues.userId,
                userName: data.dataValues.userName,
                firstName: data.dataValues.firstName,
                lastName: data.dataValues.lastName,
                role: data.dataValues.roles,
                status: data.dataValues.status
            }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
            res.json({ success: true, token: token });
        } else {
            res.json({ success: false, data: 'invalid auth code' })
        }
    }).catch(next)
})

// function to generate random code.

function generateCode() {
    let digits = '0123456789';
    let Code = '';
    for (let i = 0; i < 6; i++) {
        Code += digits[Math.floor(Math.random() * 10)];
    }
    return Code;
}

// get all Facility

router.get('/roleFacility', function (req, res, next) {
    Facility.findAll().then(data => {
        res.json({ success: true, data: data });
    })
})

module.exports = router;