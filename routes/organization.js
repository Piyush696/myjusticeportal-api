const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const request = require('request');
const jwt = require('jsonwebtoken');
var passport = require('passport');
const config = require('../config/config');
const User = require('../models').User;
const Organization = require('../models').Organization;
const Role = require('../models').Role;
const Files = require('../models').Files;
const Address = require('../models').Address;
const Facility = require('../models').Facility;
const userMeta = require('../models').UserMeta;
const Postage = require('../models').Postage;
const util = require('../utils/validateUser');
const utils = require('../utils/file');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


router.post('/lawyer/updateOrgUserDetails', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    req.body['userName'] = req.body.email
    User.update(req.body, {
        where: { userId: req.body.userId }
    }).then(result => {
        res.json({ success: true, data: result });
    }).catch(next);
})

// To invite a user by mail.

router.post('/invite-user', function(req, res, next) {
    util.validate([3, 4, 5, 6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({ where: { userName: req.body.userName } }).then(singleUserData => {
                if (singleUserData) {
                    res.json({ success: false, data: 'Email exist' });
                } else {
                    User.findOne({
                        include: [{
                            model: Organization
                        }],
                        where: { userId: req.user.userId },
                        attributes: ['userId', 'userName', 'firstName', 'middleName', 'lastName']
                    }).then(foundUserData => {
                        req.body.password = User.generateHash(' ');
                        req.body.organizationId = req.user.organizationId;
                        User.create(req.body).then((createdUser) => {
                            if (foundUserData && createdUser) {
                                Role.findOne({ where: { roleId: req.user.roles[0].roleId } }).then((roles) => {
                                    Promise.resolve(createdUser.addRole(roles)).then((userRole) => {
                                        let url = req.headers.origin + '/' + foundUserData.Organization.dataValues.type + '/registration/';
                                        let token = jwt.sign({
                                            data: createdUser.dataValues
                                        }, config.jwt.secret, { expiresIn: '1d' });
                                        let uuid = uuidv1();
                                        Postage.findOne({ where: { postageAppId: 1 } }).then((postageDetails) => {
                                            request.post({
                                                headers: { 'content-type': 'application/json' },
                                                url: `${postageDetails.dataValues.apiUrl}`,
                                                json: {
                                                    "api_key": `${postageDetails.dataValues.apiKey}`,
                                                    "uid": `${uuid}`,
                                                    "arguments": {
                                                        "recipients": [`${req.body.userName}`],
                                                        "headers": {
                                                            "subject": `${postageDetails.dataValues.project}` + ": New User Registration"
                                                        },
                                                        "template": "registration_invitation",
                                                        "variables": {
                                                            "name": `${foundUserData.dataValues.firstName + ' ' + foundUserData.dataValues.middleName + ' ' + foundUserData.dataValues.lastName}`,
                                                            "invitationlink": `${url}` + `${token}`
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
                                    });
                                }).catch(next);
                            } else {
                                res.json({ success: false, data: 'Something went wrong' });
                            }
                        }).catch(next);
                    }).catch(next);
                }
            });
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
});

// get Organisation and Address.

router.get('/', function(req, res, next) {
    util.validate([3, 4, 5, 6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({
                include: [{
                    model: Organization,
                    attributes: ['organizationId', 'name', 'tagline', 'description', 'specialty', 'colorPiker'],
                    include: [{
                            model: Address
                        },
                        {
                            model: Files,
                            as: 'logo'
                        }
                    ]
                }],
                where: { userId: req.user.userId },
                attributes: ['userId', 'firstName', 'lastName', 'userName', 'createdAt']
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// get users of organisation.

//uploadLogo

router.post('/uploadLogo', upload.any(), function(req, res, next) {
    util.validate([3, 4, 5, 6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            req.files.forEach((file) => {
                utils.uploadFile(file, file.mimetype, req.user.userId, 'mjp-public', 'public-read', function(fileId) {
                    if (fileId) {
                        Organization.update({ logoFileId: fileId }, { where: { organizationId: req.user.organizationId } }).then(() => {
                            Files.findOne({ where: { fileId: fileId } }).then((file) => {
                                res.json({ success: true, data: file });
                            })
                        })
                    }
                });
            });
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
});


router.get('/all-user', function(req, res, next) {
    util.validate([3, 4, 5, 6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Organization.findOne({
                include: [{
                    model: User,
                    attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'mobile', 'isAdmin', 'isSelfPaid', 'createdAt'],
                    include: [{
                        model: Role,
                        through: {
                            attributes: []
                        }
                    }]
                }],
                where: { organizationId: req.user.organizationId },
                attributes: ['organizationId']
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// get facilities of organisation.

router.get('/all-facilities', function(req, res, next) {
    util.validate([3, 4, 5, 6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Organization.findOne({
                include: [{
                    model: Facility,
                    through: {
                        attributes: []
                    }
                }, ],
                where: { organizationId: req.user.organizationId },
                attributes: ['organizationId']
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// Add facilities to Organisation.

router.post('/add-facility', function(req, res, next) {
    util.validate([3, 4, 5, 6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Organization.findOne({ where: { organizationId: req.user.organizationId } }).then((org) => {
                Facility.findAll({ where: { facilityId: req.body.facilityIds } }).then((foundFacility) => {
                    Promise.resolve(org.addFacility(foundFacility)).then((userFacility) => {
                        res.json({ success: true, data: userFacility });
                    }).catch(next);
                }).catch(next);
            }).catch(next);
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// Remove facility to Organisation.

router.post('/remove-facility', function(req, res, next) {
    util.validate([3, 4, 5, 6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Organization.findOne({ where: { organizationId: req.user.organizationId } }).then((org) => {
                Facility.findOne({ where: { facilityId: req.body.facilityId } }).then((foundFacility) => {
                    Promise.resolve(org.removeFacility(foundFacility)).then((userFacility) => {
                        res.json({ success: true, data: userFacility });
                    }).catch(next);
                }).catch(next);
            }).catch(next);
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// update organization.

router.put('/:addressId', function(req, res, next) {
    util.validate([3, 4, 5, 6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Organization.update(req.body.organization, { where: { organizationId: req.user.organizationId } }).then(() => {
                Address.update(req.body.address, { where: { addressId: req.params.addressId } }).then((data) => {
                    res.json({ success: true, data: data });
                })
            }).catch((err) => {
                res.json({ success: false, data: err });
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

router.delete('/deletedInvitedUser/:userId', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    util.validate([3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.destroy({
                where: { userId: req.params.userId }
            }).then(() => {
                res.json({ success: true });
            }).catch(next);
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
});




module.exports = router;