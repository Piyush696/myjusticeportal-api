const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const request = require('request');

const Organization = require('../models').Organization;
const Postage = require('../models').Postage;

// To invite a user by mail.

router.post('/invite-user', function (req, res, next) {

    let url = req.headers.origin + "/" + req.body.facilityCode + "/registration/";
    let uuid = uuidv1();
    console.log("url", url);
    console.log("req.body", req.body);
    console.log("req.user", req.user);
    let name = '';
    if (req.user.middleName) {
        name = req.user.firstName + ' ' + req.user.middleName + ' ' + req.user.lastName;
        console.log("name1", name);
    } else {
        name = req.user.firstName + ' ' + req.user.lastName;
        console.log("name22", name);
    }
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
                        "invitationlink": `${url}`,
                        "name": `${name}`
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
    });
});

module.exports = router;