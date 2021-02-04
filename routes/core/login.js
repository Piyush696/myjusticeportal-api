const router = require('express').Router();
const jwt = require('jsonwebtoken');
var passport = require('passport');
var twilio = require('twilio');

const User = require('../../models').User;
const config = require('../../config/config');
const Twilio = require('../../models').Twilio;
const Role = require('../../models').Role;
const Organization = require('../../models').Organization;
var Facility = require('../../models').Facility;
const jwtUtils = require('../../utils/create-jwt');
const requestIp = require('request-ip');
const user_facility = require('../../models').user_facility
    /* Login user. */
router.post('/login', function(req, res, next) {
    User.findOne({
        include: [{
                model: Role,
                through: {
                    attributes: [],
                    attributes: ['roleId', 'name'],
                }
            },
            {
                model: Facility,
                through: {
                    attributes: [],
                    attributes: ['facilityId'],
                }
            }
        ],
        where: { userName: req.body.userName }
    }).then((user) => {
        if (!user) {
            res.json({ success: false, data: 'Invalid User.' })
        } else if (user && !user.isValidPassword(req.body.password)) {
            res.json({ success: false, data: 'Invalid Password.' })
        } else {
            if (user.roles[0].roleId === 1) {
                const clientIp = requestIp.getClientIp(req);
                console.log(1, clientIp)
                Facility.findOne({ where: { ipAddress: clientIp } }).then((foundFacility) => {
                    console.log(2, foundFacility)

                    if (foundFacility) {
                        user_facility.findOne({ where: { userId: user.userId, isActive: true } }).then((user_fac) => {
                            // console.log(3, foundFacility.facilityId, user_facility.facilityId)
                            if (foundFacility.facilityId != user_fac.facilityId) {

                                user_facility.update({ isActive: false }, { where: { userId: user.userId } }).then(() => {
                                    console.log(4)
                                    let x = {
                                        userId: user.userId,
                                        facilityId: foundFacility.facilityId,
                                        isActive: true
                                    }

                                    user_facility.create(x).then((updatedFacility) => {
                                        console.log(5, updatedFacility)

                                        User.findOne({
                                            include: [{
                                                    model: Role,
                                                    through: {
                                                        attributes: [],
                                                        attributes: ['roleId', 'name'],
                                                    }
                                                },
                                                {
                                                    model: Facility,
                                                    through: {
                                                        attributes: [],
                                                        attributes: ['facilityId'],
                                                    }
                                                }

                                            ],
                                            where: { userName: req.body.userName }
                                        }).then((inmate) => {
                                            jwtUtils.createJwt(inmate, req.body.rememberMe, function(token) {
                                                if (token) {
                                                    res.json({ success: true, token: token });
                                                } else {
                                                    res.json({ success: false });
                                                }
                                            });
                                        })
                                    }).catch((err) => {
                                        console.log(err)
                                    });

                                })


                            } else {

                                console.log(6)
                                User.findOne({
                                    include: [{
                                            model: Role,
                                            through: {
                                                attributes: [],
                                                attributes: ['roleId', 'name'],
                                            }
                                        },
                                        {
                                            model: Facility,
                                            through: {
                                                attributes: [],
                                                attributes: ['facilityId'],
                                            }
                                        },

                                    ],
                                    where: { userName: req.body.userName }
                                }).then((inmate) => {
                                    jwtUtils.createJwt(inmate, req.body.rememberMe, function(token) {
                                        if (token) {
                                            res.json({ success: true, token: token });
                                        } else {
                                            res.json({ success: false });
                                        }
                                    });
                                })
                            }

                        })
                    } else {

                        Facility.findOne({ where: { ipAddress: 'outside' } }).then((outsideFacility) => {
                            console.log(7, outsideFacility)
                            user_facility.findOne({ where: { userId: user.userId, isActive: true, facilityId: outsideFacility.facilityId } }).then((user_fac) => {
                                console.log(8, user_fac)
                                if (!user_fac) {

                                    user_facility.update({ isActive: false }, { where: { userId: user.userId } }).then(() => {
                                        let x = {
                                            userId: user.userId,
                                            facilityId: outsideFacility.facilityId,
                                            isActive: true
                                        }
                                        user_facility.create(x).then((updatedFacility) => {
                                            console.log(9, updatedFacility)
                                            User.findOne({
                                                include: [{
                                                        model: Role,
                                                        through: {
                                                            attributes: [],
                                                            attributes: ['roleId', 'name'],
                                                        }
                                                    },
                                                    {
                                                        model: Facility,
                                                        through: {
                                                            attributes: [],
                                                            attributes: ['facilityId'],
                                                        }
                                                    },

                                                ],
                                                where: { userName: req.body.userName }
                                            }).then((inmate) => {
                                                jwtUtils.createJwt(inmate, req.body.rememberMe, function(token) {
                                                    if (token) {
                                                        res.json({ success: true, token: token });
                                                    } else {
                                                        res.json({ success: false });
                                                    }
                                                });
                                            })
                                        }).catch((next) => {
                                            console.log(next)
                                        })
                                    })

                                } else {
                                    console.log(10)
                                    User.findOne({
                                        include: [{
                                                model: Role,
                                                through: {
                                                    attributes: [],
                                                    attributes: ['roleId', 'name'],
                                                }
                                            },
                                            {
                                                model: Facility,
                                                through: {
                                                    attributes: [],
                                                    attributes: ['facilityId'],
                                                }
                                            }
                                        ],
                                        where: { userName: req.body.userName }
                                    }).then((inmate) => {
                                        jwtUtils.createJwt(inmate, req.body.rememberMe, function(token) {
                                            if (token) {
                                                res.json({ success: true, token: token });
                                            } else {
                                                res.json({ success: false });
                                            }
                                        });
                                    }).catch((next) => {
                                        console.log(next)
                                    })
                                }
                            })

                        })



                    }



                })


            } else if (user.roles[0].roleId != 1) {
                if (user.isMFA && user.status) {
                    if (user.mobile && user.countryCode) {
                        Twilio.findOne({ where: { twilioId: 1 } }).then(twilioCredentials => {
                            let code = generateCode();
                            var client = new twilio(twilioCredentials.accountSid, twilioCredentials.authToken);
                            client.messages.create({
                                body: 'My Justice Portal' + ': ' + code + ' - This is your verification code.',
                                to: '+' + user.countryCode + user.mobile, // Text this number
                                from: twilioCredentials.from // From a valid Twilio number
                            }).then((message) => {
                                User.update({ authCode: code }, { where: { userId: user.dataValues.userId } }).then((user) => {
                                    res.json({ success: false, data: 'Please Enter Your auth code.' })
                                }).catch(next)
                            }).catch((err) => {
                                console.log(err)
                                res.json({ success: false, data: err });
                            })
                        })
                    } else {
                        res.json({ success: false, data: 'Please Register your Mobile Number.' })
                    }
                } else if (user.isMFA && !user.status) {
                    if (user.roles[0].roleId === 3 || user.roles[0].roleId === 5) {
                        jwtUtils.createJwt(user, req.body.rememberMe, function(token) {
                            if (token) {
                                res.json({ success: false, token: token })
                            } else {
                                res.json({ success: false });
                            }
                        });
                    } else {
                        res.json({ success: false, data: 'Your account is under review. Please contact Administrator to activate your account.' })
                    }
                } else {
                    if (!user.isMFA && !user.status) {
                        res.json({ success: false, data: 'Please complete your registration.' })
                    } else {
                        jwtUtils.createJwt(user, req.body.rememberMe, function(token) {
                            if (token) {
                                res.json({ success: true, token: token });
                            } else {
                                res.json({ success: false });
                            }
                        });
                    }
                }
            }
        }
    }).catch(next);
});

//function to generate random code
function generateCode() {
    let digits = '0123456789';
    let Code = '';
    for (let i = 0; i < 6; i++) {
        Code += digits[Math.floor(Math.random() * 10)];
    }
    return Code;
}

/** if ismfa verify otp */
router.post('/verify-otp', async function(req, res, next) {
    User.findOne({
        include: [{
                model: Role,
                through: {
                    attributes: [],
                    attributes: ['roleId', 'name'],
                }
            },
            {
                model: Facility,
                through: {
                    attributes: [],
                    attributes: ['facilityId'],
                }
            },
            {
                model: Organization,
                attributes: ['organizationId'],
            }
        ],
        where: { userName: req.body.userName }
    }).then((user) => {
        let date = new Date();
        let x = date - user.dataValues.updatedAt;
        x = Math.round((x / 1000) / 60);
        if (x <= 5 && user.dataValues.authCode == req.body.otp) {
            jwtUtils.createJwt(user.dataValues, req.body.rememberMe, function(token) {
                if (token) {
                    res.json({ success: true, token: token });
                } else {
                    res.json({ success: false });
                }
            });
        } else {
            res.json({ success: false, data: 'invalid otp' });
        }
    }).catch(next);
})


/**generate otp during login*/

router.post('/resendCode', async function(req, res, next) {
    console.log(req.body)
    User.findOne({ where: { userName: req.body.userName } }).then((user) => {
        let code = generateCode();
        Twilio.findOne({ where: { twilioId: 1 } }).then(twilioCredentials => {
            var client = new twilio(twilioCredentials.accountSid, twilioCredentials.authToken);
            client.messages.create({
                body: 'My Justice Portal' + ': ' + code + ' - This is your verification code.',
                to: '+' + user.countryCode + user.mobile, // Text this number
                from: twilioCredentials.from // From a valid Twilio number
            }).then((message) => {
                User.update({ authCode: code }, {
                    where: { userName: req.body.userName }
                }).then(() => {
                    res.json({ success: true })
                }).catch(next)
            }).catch((err) => {
                res.json({ success: false })
            })
        })
    })
});

module.exports = router;