const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const User = require('../../models').User;
const UserMeta = require('../../models').UserMeta;
const User_SecurityQuestion_Answers = require('../../models').User_SecurityQuestion_Answers;
const Role = require('../../models').Role;
var Facility = require('../../models').Facility;

// User registration.

router.post('/', function (req, res, next) {
    console.log(req.body)
    User.create({
        password: User.generateHash(req.body.password),
        firstName: req.body.firstName, lastName: req.body.lastName,
        userName: req.body.userName, middleName: req.body.middleName, isMFA: false
    }).then((user) => {
        console.log(user.userId)
        req.body.userMeta.map((element) => {
            element['userId'] = user.userId
            element['createdBy'] = user.userId
        })
        req.body.securityQuestionData.map((element) => {
            element['userId'] = user.userId
        })
        console.log(req.body.securityQuestionData, req.body.userMeta)
        UserMeta.bulkCreate(req.body.userMeta).then((result) => {
            User_SecurityQuestion_Answers.bulkCreate(req.body.securityQuestionData).then(data => {
                Role.findAll({ where: { roleId: 1 } }).then((roles) => {
                    Promise.resolve(user.setRoles(roles)).then((userRole) => {
                        Facility.findOne({ where: { facilityCode: req.body.facilityCode } }).then((facility) => {
                            Promise.resolve(user.addFacility(facility)).then((userFacility) => {
                                User.update({ status: true }, {
                                    where: { userId: user.userId }
                                }).then((updateUser) => {
                                    let expiresIn = req.body.rememberMe ? '15d' : '1d';
                                    let token = jwt.sign({
                                        userId: user.userId,
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        userName: user.userName,
                                        role: roles,
                                        facilityCode: req.body.facilityCode
                                    }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
                                    res.json({ success: true, token: token });
                                }).catch(next);
                            })
                        })
                    })
                }).catch(next);
            }).catch(next);
        }).catch(next);
    }).catch(next);
});

module.exports = router;