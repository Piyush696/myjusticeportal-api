const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const request = require('request');

const User = require('../models').User;
const Organization = require('../models').Organization;
const Role = require('../models').Role;
const Address = require('../models').Address;
const Facility = require('../models').Facility;
const Postage = require('../models').Postage;

// To invite a user by mail.

router.post('/invite-user', function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Organization
            }
        ],
        where: { userId: req.user.userId },
        attributes: ['userId', 'userName', 'firstName', 'middleName', 'lastName']
    }).then(foundUserData => {
        let url = req.headers.origin + '/' + foundUserData.Organization.dataValues.orgCode
            + '/' + foundUserData.Organization.dataValues.type + '/registration/';
        let uuid = uuidv1();
        Postage.findOne({ where: { postageAppId: 1 } }).then((postageDetails) => {
            request.post({
                headers: { 'content-type': 'application/json' },
                url: `${postageDetails.dataValues.apiUrl}`,
                json: {
                    "api_key": `${postageDetails.dataValues.apiKey}`,
                    "uid": `${uuid}`,
                    "arguments": {
                        "recipients": [`${req.body.email}`],
                        "headers": {
                            "subject": `${postageDetails.dataValues.project}` + ": New User Registration"
                        },
                        "template": "registration_invitation",
                        "variables": {
                            "name": `${foundUserData.dataValues.firstName + ' ' + foundUserData.dataValues.middleName + ' ' + foundUserData.dataValues.lastName}`,
                            "invitationlink": `${url}`
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
    }).catch(next);
});

// To invite a user by mail.

router.post('/notify-admin', function (req, res, next) {
    Role.findOne({
        include: [
            {
                model: User,
                attributes: ['userId', 'userName', 'firstName', 'isAdmin', 'status']
            }
        ],
        where: { roleId: 7 },
        attributes: ['roleId', 'name']
    }).then(foundUserData => {
        if (foundUserData) {
            let emailList = [];
            foundUserData.dataValues.users.forEach((singleUser, index, array) => {
                emailList.push(singleUser.dataValues.userName);
            });
            let url = req.headers.origin + '/users/' + req.body.userId;
            let uuid = uuidv1();
            Postage.findOne({ where: { postageAppId: 1 } }).then((postageDetails) => {
                request.post({
                    headers: { 'content-type': 'application/json' },
                    url: `${postageDetails.dataValues.apiUrl}`,
                    json: {
                        "api_key": `${postageDetails.dataValues.apiKey}`,
                        "uid": `${uuid}`,
                        "arguments": {
                            "recipients": emailList,
                            "headers": {
                                "subject": `${postageDetails.dataValues.project}` + ": New User Registration Approval"
                            },
                            "template": "admin_notification",
                            "variables": {
                                "name": `${req.body.firstName + ' ' + req.body.middleName + ' ' + req.body.lastName}`,
                                "link": `${url}`
                            }
                        }
                    }
                }, function (error, response) {
                    if ((response.body.response.status !== 'unauthorized') && (response.body.response.status != 'bad_request')) {
                        if (response.body.data.message.status == 'queued') {
                            res.json({ success: true, data: 'Notification mail sent' });
                        } else {
                            res.json({ success: false, data: 'Notification mail not sent' });
                        }
                    } else {
                        res.json({ success: false, data: 'Notification mail not sent' });
                    }
                });
            }).catch(next);
        }
    });
});

router.get('/', function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Organization,
                include: [
                    {
                        model: Address
                    }
                ]
            }
        ],
        where: { userId: req.user.userId }
    }).then(data => {
        res.json({ success: true, data: data });
    }).catch((next) => {
        console.log(next);
    })
})

module.exports = router;