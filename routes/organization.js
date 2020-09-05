const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const request = require('request');
const Organization = require('../models').Organization;
const Address = require('../models').Address;
const Facility = require('../models').Facility;
const Postage = require('../models').Postage;
const User = require('../models').User
const Role = require('../models').Role;

// To invite a user by mail.

router.post('/invite-user', function (req, res, next) {
    let url = req.headers.origin + "/" + req.body.facilityCode + "/registration/";
    let uuid = uuidv1();
    console.log("req.headers", req.headers);
    console.log("url", url);
    console.log("req.body", req.body);
    Postage.findOne({ where: { postageAppId: 1 } }).then((postageDetails) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `${postageDetails.dataValues.apiUrl}`,
            json: {
                "api_key": `${postageDetails.dataValues.apiKey}`,
                "uid": `${uuid}`,
                "arguments": {
                    "recipients": [`${req.body.recipientEmail}`],
                    "headers": {
                        "subject": `${postageDetails.dataValues.project}` + ": New User Registration"
                    },
                    "template": "registration_invitation",
                    "variables": {
                        "name": `${req.user.firstName + ' ' + req.user.lastName}`,
                        "invitationLink": `${url}`
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
    }).catch((next) => {
        console.log(next);
    })
});

//get Organisation and Address
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
    }).catch(next)
})

// get users of organisation
router.get('/all-user', function (req, res, next) {
    Organization.findOne({
        include: [
            {
                model: User,
                include: [
                    {
                        model: Role, through: {
                            attributes: []
                        },
                    }
                ]
            }
        ],
        where: { organizationId: req.user.organizationId }
    }).then(data => {
        res.json({ success: true, data: data });
    }).catch((next) => {
        console.log(next);
    })
})

// get users of organisation
router.get('/all-facilities', function (req, res, next) {
    Organization.findOne({
        include: [
            {
                model: Facility, through: {
                    attributes: []
                }
            },
        ],
        where: { organizationId: req.user.organizationId }
    }).then(data => {
        res.json({ success: true, data: data });
    }).catch((next) => {
        console.log(next);
    })
})


// Add facilities to Organisation
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

// Remove facility to Organisation
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


module.exports = router;