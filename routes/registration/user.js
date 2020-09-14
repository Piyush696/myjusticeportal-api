const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

const User = require('../../models').User;
const UserMeta = require('../../models').UserMeta;
const User_SecurityQuestion_Answers = require('../../models').User_SecurityQuestion_Answers;
const Role = require('../../models').Role;
const Facility = require('../../models').Facility;
const utils = require('../../utils/validation');

// User registration.

router.post('/', function (req, res, next) {
    User.create({
        password: User.generateHash(req.body.password),
        firstName: req.body.firstName, lastName: req.body.lastName,
        userName: req.body.userName, middleName: req.body.middleName, isMFA: false, status: true
    }).then((user) => {
        req.body.userMeta.map((element) => {
            element['userId'] = user.userId
            element['createdBy'] = user.userId
        })
        req.body.securityQuestionData.map((element) => {
            element['userId'] = user.userId
        })
        UserMeta.bulkCreate(req.body.userMeta).then(() => {
            User_SecurityQuestion_Answers.bulkCreate(req.body.securityQuestionData).then(() => {
                return Role.findAll({ where: { roleId: 1 } }).then((roles) => {
                    Promise.resolve(user.setRoles(roles)).then(() => {
                        return Facility.findOne({ where: { facilityCode: req.body.facilityCode } }).then((facility) => {
                            Promise.resolve(user.addFacility(facility)).then(() => {
                                let expiresIn = req.body.rememberMe ? '15d' : '1d';
                                let token = jwt.sign({
                                    userId: user.userId,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    userName: user.userName,
                                    roles: roles,
                                    facility: facility
                                }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
                                return res.json({ success: true, token: token });
                            })
                        })
                    })
                }).catch(next);
            }).catch(next);
        }).catch(next);
    }).catch(next => {
        utils.validator(next, function (err) {
            res.status(400).json(err)
        })
    });
})
module.exports = router;