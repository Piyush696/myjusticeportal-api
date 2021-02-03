const express = require('express');
const router = express.Router();
var passport = require('passport');
const request = require('request');
const jwt = require('jsonwebtoken');
const uuidv1 = require('uuid/v1');
var twilio = require('twilio');

const User = require('../models').User;
const Role = require('../models').Role;
const config = require('../config/config');
const Twilio = require('../models').Twilio;
var Facility = require('../models').Facility;
const userMeta = require('../models').UserMeta;
const Postage = require('../models').Postage;
const util = require('../utils/validateUser');
const jwtUtils = require('../utils/create-jwt');
const Organization = require('../models').Organization;
const Address = require('../models').Address;
const organization = require('../models/organization');


/*findAll user include role */

router.get('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    User.findAll({
        include: [{
            model: Role,
            through: {
                attributes: []
            },
        },
        {
            model: Organization,
            include: [{
                model: Address,
                attributes: [ "state"],
            }]
        }
    ],
        order: [
            ['createdAt', 'DESC']
        ]
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch(next)
})

// single user.

router.get('/user', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    User.findOne({
        include: [{
                model: Role,
                through: {
                    attributes: []
                }
            },
            {
                model: Facility,
                through: {
                    attributes: [],
                },
            },
            {
                model: userMeta
            }
        ],
        where: { userId: req.user.userId }
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch(next);
})

/*update Password */

router.put('/password', passport.authenticate('jwt', { session: false }), function(req, res, next) {
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
router.put('/', function(req, res, next) {
    User.update({ status: req.body.value.status }, {
        where: { userName: req.body.value.userName }
    }).then((user) => {
        User.findOne({
            include: [{
                    model: Role,
                    through: {
                        attributes: []
                    },
                },
                {
                    model: Facility,
                    through: {
                        attributes: []
                    },
                }
            ],
            where: { userName: req.body.value.userName }
        }).then((user) => {
            jwtUtils.createJwt(user, req.body.rememberMe, function(token) {
                if (token) {
                    res.json({ success: true, token: token });
                } else {
                    res.json({ success: false });
                }
            });
        })
    }).catch(next);
})

// myacc User Update

router.put('/updateUser', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.body.userEmail) {
        req.body['email'] = req.body.userEmail
    }
    User.update(req.body, {
        where: { userId: req.user.userId }
    }).then(result => {
        res.json({ success: true, data: result });
    }).catch(next);
})

router.put('/update/admin', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body)
    User.update({ isAdmin: req.body.isAdmin }, {
        where: { userId: req.body.userId }
    }).then(result => {
        res.json({ success: true, data: result });
    }).catch(next);
})

/*update Password */

router.put('/reset-pass', function(req, res, next) {
    let newData = {};
    let query = {};
    User.findOne({
        where: { userName: req.body.userName }
    }).then((user) => {
        // if (user.securityQuestionAnswered === 3) {
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
            // }
    }).catch(next)
});

// delete user.

router.delete('/:userId', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    if (req.user.roles[0].roleId === 7 && req.user.userId !== req.params.userId) {
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

router.get('/singleUser/:userId', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    if (req.user.roles[0].roleId === 7 || req.user.roles[0].roleId === 1 || req.user.roles[0].roleId === 3) {
        User.findOne({
            include: [{
                    model: Role,
                    through: {
                        attributes: []
                    }
                },
                {
                    model: Facility,
                    through: {
                        attributes: []
                    }
                },
                {
                    model: Organization,
                    attributes: ['name'],
                    include: [{
                        model: Address,
                        attributes: ['street1', 'street2', "city", "state", "country", "zip"],
                    }]
                }
            ],
            where: { userId: req.params.userId }
        }).then((userData) => {
            res.json({ success: true, data: userData });
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

// Update User by userId.

router.put('/updateSingleUser', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.roles[0].roleId === 7) {
        User.update(req.body, {
            where: { userId: req.body.userId }
        }).then(result => {
            res.json({ success: true, data: result });
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

router.put('/updateStatus', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.roles[0].roleId === 7) {
        User.update(req.body, {
            where: { userId: req.body.userId }
        }).then(result => {
            User.findOne({ where: { userId: req.body.userId } }).then((user) => {
                let url = req.headers.origin + '/login/';
                let uuid = uuidv1();
                let message;
                if (req.body.status) {
                    message = 'Your account has been approved and is now active please login.'
                } else {
                    message = 'Your account has been deactivated.'
                }
                Postage.findOne({ where: { postageAppId: 1 } }).then((postageDetails) => {
                    request.post({
                        headers: { 'content-type': 'application/json' },
                        url: `${postageDetails.dataValues.apiUrl}`,
                        json: {
                            "api_key": `${postageDetails.dataValues.apiKey}`,
                            "uid": `${uuid}`,
                            "arguments": {
                                "recipients": [`${user.dataValues.userName}`],
                                "headers": {
                                    "subject": `${postageDetails.dataValues.project}`
                                },
                                "template": "account_approval_notification",
                                "variables": {
                                    "link": `${url}`,
                                    "message": `${message}`
                                }
                            }
                        }
                    }, function(error, response) {
                        if ((response.body.response.status !== 'unauthorized') && (response.body.response.status != 'bad_request')) {
                            if (response.body.data.message.status == 'queued') {
                                res.json({ success: true, data: 'Invitation sent' });
                            } else {
                                res.json({ success: false, data: 'Invitation not sent' });
                            }
                        } else {
                            res.json({ success: false, data: 'Invitation not sent' });
                        }
                    });
                }).catch(next);
            })
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

// Change Role.

router.put('/changeRole', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.roles[0].roleId === 7) {
        User.findOne({
            include: [{
                model: Role,
                through: {
                    attributes: []
                }
            }],
            where: { userId: req.body.userId }
        }).then((userData) => {
            Promise.resolve(userData.setRoles(req.body.roleId)).then((userRole) => {
                res.json({ success: true, data: userData });
            })
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

// Change Facility.
router.put('/changeFacility', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.roles[0].roleId === 7) {
        User.findOne({
            include: [{
                model: Facility,
                through: {
                    attributes: []
                }
            }],
            where: { userId: parseInt(req.body.userId) }
        }).then((userData) => {
            Promise.resolve(userData.setFacilities(req.body.facilityId)).then((userFacility) => {
                res.json({ success: true, data: userFacility });
            }).catch(next)
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

/**generate otp during registration*/

router.post('/auth/register', async function(req, res, next) {
    let code = generateCode();
    Twilio.findOne({ where: { twilioId: 1 } }).then(twilioCredentials => {
        var client = new twilio(twilioCredentials.accountSid, twilioCredentials.authToken);
        client.messages.create({
            body: 'My Justice Portal' + ': ' + code + ' - This is your verification code.',
            to: '+' + req.body.countryCode + req.body.mobile, // Text this number
            from: twilioCredentials.from // From a valid Twilio number
        }).then((message) => {
            User.update({ authCode: code, mobile: req.body.mobile, countryCode: req.body.countryCode }, {
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

router.post('/register/verify-sms', async function(req, res, next) {
    User.findOne({
        include: [{
            model: Role,
            through: {
                attributes: []
            }
        }],
        where: { userName: req.body.userName }
    }).then((data) => {
        let date = new Date();
        let x = date - data.dataValues.updatedAt;
        x = Math.round((x / 1000) / 60);
        if (x <= 5 && data.dataValues.authCode == req.body.otp) {
            jwtUtils.createJwt(data.dataValues, req.body.rememberMe, function(token) {
                if (token) {
                    res.json({ success: true, token: token });
                } else {
                    res.json({ success: false });
                }
            });
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

router.get('/roleFacility', function(req, res, next) {
    Facility.findAll().then(data => {
        res.json({ success: true, data: data });
    })
})

//create user by superadmin
router.post('/createUser', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    util.validate([7], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.create({
                password: User.generateHash(req.body.password),
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                userName: req.body.userName,
                middleName: req.body.middleName,
                isMFA: false,
                status: true
            }).then((user) => {
                Role.findAll({ where: { roleId: 7 } }).then((roles) => {
                    Promise.resolve(user.setRoles(roles)).then((userRole) => {
                        res.json({ success: true, data: userRole });
                    })
                }).catch(next);
            }).catch(next);
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

//bulk delete by superadmin
router.post('/deleteUsers', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    console.log(req.body)
    util.validate([7], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            req.body.forEach(element => {
                User.destroy({ where: { userId: element } }).then(() => {})
            });
            res.json({ success: true, data: 'Users deleted.' });
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

module.exports = router;