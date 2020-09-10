const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const request = require('request');
const jwt = require('jsonwebtoken');

const config = require('../config/config');
const User = require('../models').User;
const Organization = require('../models').Organization;
const Role = require('../models').Role;
const Address = require('../models').Address;
const Facility = require('../models').Facility;
const Postage = require('../models').Postage;

// To invite a user by mail.

router.post('/invite-user', function (req, res, next) {
    User.findOne({ where: { userName: req.body.userName } }).then(singleUserData => {
        if (singleUserData) {
            res.json({ success: false, data: 'Email exist' });
        } else {
            User.findOne({
                include: [
                    {
                        model: Organization
                    }
                ],
                where: { userId: req.user.userId },
                attributes: ['userId', 'userName', 'firstName', 'middleName', 'lastName']
            }).then(foundUserData => {
                req.body.password = User.generateHash(' ');
                req.body.organizationId = req.user.organizationId;
                req.body.isMFA = true;
                User.create(req.body).then((createdUser) => {
                    if (foundUserData && createdUser) {
                        Role.findOne({ where: { roleId: req.user.role[0].roleId } }).then((roles) => {
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
                                    }, function (error, response) {
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
});

// get Organisation and Address.

router.get('/', function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Organization, attributes: ['organizationId', 'name'],
                include: [
                    {
                        model: Address
                    }
                ]
            }
        ],
        where: { userId: req.user.userId },
        attributes: ['userId', 'firstName', 'lastName', 'userName', 'createdAt']
    }).then(data => {
        res.json({ success: true, data: data });
    }).catch(next)
})

// get users of organisation.

router.get('/all-user', function (req, res, next) {
    Organization.findOne({
        include: [
            {
                model: User, attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt'],
                include: [
                    {
                        model: Role, through: {
                            attributes: []
                        }
                    }
                ]
            }
        ],
        where: { organizationId: req.user.organizationId },
        attributes: ['organizationId']
    }).then(data => {
        res.json({ success: true, data: data });
    }).catch((next) => {
        console.log(next);
    })
})

// get facilities of organisation.

router.get('/all-facilities', function (req, res, next) {
    Organization.findOne({
        include: [
            {
                model: Facility, through: {
                    attributes: []
                }
            },
        ],
        where: { organizationId: req.user.organizationId },
        attributes: ['organizationId']
    }).then(data => {
        res.json({ success: true, data: data });
    }).catch((next) => {
        console.log(next);
    })
})

// Add facilities to Organisation.

router.post('/add-facility', function (req, res, next) {
    Organization.findOne(
        { where: { organizationId: req.user.organizationId } }
    ).then((org) => {
        Facility.findAll({ where: { facilityId: req.body.facilityIds } }).then((foundFacility) => {
            Promise.resolve(org.addFacility(foundFacility)).then((userFacility) => {
                res.json({ success: true, data: userFacility });
            }).catch(next);
        }).catch(next);
    }).catch(next);
})

// Remove facility to Organisation.

router.post('/remove-facility', function (req, res, next) {
    Organization.findOne(
        { where: { organizationId: req.user.organizationId } }
    ).then((org) => {
        Facility.findOne({ where: { facilityId: req.body.facilityId } }).then((foundFacility) => {
            Promise.resolve(org.removeFacility(foundFacility)).then((userFacility) => {
                res.json({ success: true, data: userFacility });
            }).catch(next);
        }).catch(next);
    }).catch(next);
})

// update organization.

router.put('/:addressId', function (req, res, next) {
    Organization.update(req.body.organization, { where: { organizationId: req.user.organizationId } }).then(() => {
        Address.update(req.body.address, { where: { addressId: req.params.addressId } }).then((data) => {
            res.json({ success: true, data: data });
        })
    }).catch(next)
})

module.exports = router;