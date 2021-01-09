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
const jwtUtils = require('../../utils/create-jwt');
const requestIp = require('request-ip');


// User registration.

router.post('/', function (req, res, next) {
    User.create({
        password: User.generateHash(req.body.password),
        firstName: req.body.firstName, lastName: req.body.lastName,
        userName: req.body.userName, middleName: req.body.middleName, mobile: req.body.mobile,
        isMFA: false, status: true, email: req.body.email
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
                        const clientIp = requestIp.getClientIp(req);
                        return Facility.findOne({ where: { ipAddress: clientIp } }).then((facility) => {
                            console.log(facility)
                            if (facility) {
                                user['roles'] = roles;
                                user['facilities'] = [facility];
                                console.log(user)
                                Promise.resolve(user.addFacility(facility)).then(() => {
                                console.log(user)
                                    jwtUtils.createJwt(user, req.body.rememberMe, function (token) {
                                        if (token) {
                                            res.json({ success: true, token: token });
                                        } else {
                                            res.json({ success: false });
                                        }
                                    });
                                }).catch((next)=>{
                                    console.log(next)
                                });
                            } else {
                                return Facility.findOne({ where: { ipAddress: 'outside' } }).then((foundFacility) => {
                                    Promise.resolve(user.addFacility(foundFacility)).then(() => {
                                        user['roles'] = roles;
                                        user['facilities'] = [foundFacility];
                                        jwtUtils.createJwt(user, req.body.rememberMe, function (token) {
                                            if (token) {
                                                res.json({ success: true, token: token });
                                            } else {
                                                res.json({ success: false });
                                            }
                                        });
                                    }).catch(next);
                                })
                            }
                        }).catch((next)=>{
                            console.log('1',next)
                        });
                    })
                }).catch((next)=>{
                    console.log('2',next)
                });
            }).catch((next)=>{
                console.log('3',next)
            });
        }).catch((next)=>{
            console.log('4',next)
        });
    }).catch(next => {
        console.log('5',next)
        utils.validator(next, function (err) {
            res.status(400).json(err)
        })
    });
})

//to check user facility
router.get('/checkFacility', function (req, res, next) {
    const clientIp = requestIp.getClientIp(req);
    Facility.findOne({ where: { ipAddress: clientIp } }).then(facility => {
        if (facility) {
            res.status(200).json({ data: facility.facilityName })
        } else {
            res.status(200).json({ data: false })
        }
    })

})

module.exports = router;