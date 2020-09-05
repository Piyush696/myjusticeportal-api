const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const request = require('request');

const Role = require('../models').Role;
const User = require('../models').User;
const Postage = require('../models').Postage;

module.exports = {
    notifyAdmin: function (userDetails, req) {
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
                let url = req.headers.origin;
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
                                    "name": `${userDetails.firstName + ' ' + userDetails.middleName + ' ' + userDetails.lastName}`,
                                    "email": `${userDetails.userName}`,
                                    "link": `${url}`
                                }
                            }
                        }
                    })
                });
            }
        });
    }
};