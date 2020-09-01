const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../../models').User;
const UserMeta = require('../../models').UserMeta;
const User_SecurityQuestion_Answers = require('../../models').User_SecurityQuestion_Answers;
const Role = require('../../models').Role;
var Facility = require('../../models').Facility;

// User registration.

router.post('/user-registration', function (req, res, next) {
    let isMfa;
    if (req.body.roleId == 1) {
        isMfa = false;
    } else {
        isMfa = true;
    }
    User.create({
        email: req.body.email, password: User.generateHash(req.body.password),
        firstName: req.body.firstName, lastName: req.body.lastName,
        userName: req.body.userName, middleName: req.body.middleName, isMFA: isMfa
    }).then((user) => {
        var userMetaList = req.body.metaList;
        var userMetaCount = 0;
        userMetaList.forEach((userMeta, userMetaIndex, userMetaArray) => {
            UserMeta.create({
                metaKey: userMeta.metaKey, metaValue: userMeta.metaValue,
                userId: user.userId, createdBy: user.userId
            }).then((result) => {
                if (userMetaCount === userMetaArray.length - 1) {
                    // res.json({ success: true, data: result });
                    User_SecurityQuestion_Answers.findOne({
                        where: { userId: user.dataValues.userId, securityQuestionId: req.body.securityQuestionId }
                    }).then(data => {
                        if (data && data.securityQuestionId == req.body.securityQuestionId) {
                            User_SecurityQuestion_Answers.update({ answer: req.body.answer }, {
                                where: { userId: data.userId, securityQuestionId: data.securityQuestionId }
                            }).then((data) => {
                                res.json({ success: true, data: data });
                            })
                        }
                        else {
                            User_SecurityQuestion_Answers.create({
                                securityQuestionId: req.body.securityQuestionId,
                                answer: req.body.answer, userId: user.userId
                            }).then(data => {
                                res.json({ success: true, data: data });
                            })
                        }
                    });
                }
                userMetaCount++;
            }).catch(next);
        })
        // Role.findAll({ where: { roleId: req.body.roleId } }).then((roles) => {
        //     Promise.resolve(user.setRoles(roles)).then((userRole) => {
        //         Facility.findOne({ where: { facilityCode: req.body.facilityCode } }).then((facility) => {
        //             Promise.resolve(user.addFacility(facility)).then((userFacility) => {
        //                 res.json({ success: true, data: user });
        //             })
        //         })
        //     })
        // }).catch(next);
    }).catch(next);
});

module.exports = router;