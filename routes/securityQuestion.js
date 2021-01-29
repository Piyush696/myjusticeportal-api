const express = require('express');
const router = express.Router();
var passport = require('passport');
const SecurityQuestion = require('../models').SecurityQuestion;
const User = require('../models').User;
const { Sequelize } = require("sequelize");

const securityQuestion = require('../models/securityQuestion');
const User_SecurityQuestion_Answers = require('../models').User_SecurityQuestion_Answers;
const Role = require('../models').Role;
const Postage = require('../models').Postage;
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const request = require('request');

router.post('/', function(req, res, next) {
    User.findOne({ where: { userName: req.body.userName } }).then((user) => {
        User_SecurityQuestion_Answers.findOne({
            where: { userId: user.dataValues.userId, securityQuestionId: req.body.securityQuestionId }
        }).then(data => {
            if (data && data.securityQuestionId == req.body.securityQuestionId) {
                User_SecurityQuestion_Answers.update({ answer: req.body.answer }, {
                    where: { userId: data.userId, securityQuestionId: data.securityQuestionId }
                }).then((data) => {
                    res.json({ success: true, data: data });
                })
            } else {
                User_SecurityQuestion_Answers.create({
                    securityQuestionId: req.body.securityQuestionId,
                    answer: req.body.answer,
                    userId: user.userId
                }).then(data => {
                    res.json({ success: true, data: data });
                })
            }
        });
    })
})

router.get('/:roleId', function(req, res, next) {
    SecurityQuestion.findAll({ where: { roleId: req.params.roleId } }).then(securityQuestion => {
        res.json({ success: true, data: securityQuestion });
    })
})

router.post('/forgot-password', function(req, res, next) {
    User.findOne({
        include: [{
                model: SecurityQuestion,
                through: { attributes: [] }
            },
            {
                model: Role,
                through: { attributes: [] }
            }
        ],
        where: { $or: [{ userName: req.body.userName }, { email: req.body.userName }], }
    }).then(userDetails => {
        if (userDetails) {
            if (userDetails.dataValues.roles[0].roleId == 1) {
                res.json({ success: true, data: userDetails });
            } else {
                let token = jwt.sign({
                    data: userDetails.dataValues
                }, config.jwt.secret, { expiresIn: 60 * 60 });
                let uuid = uuidv1();
                let url = req.headers.origin + "/reset-password/";
                Postage.findOne({ where: { postageAppId: 1 } }).then((passwordResetDetails) => {
                    request.post({
                        headers: { 'content-type': 'application/json' },
                        url: `${passwordResetDetails.dataValues.apiUrl}`,
                        json: {
                            "api_key": `${passwordResetDetails.dataValues.apiKey}`,
                            "uid": `${uuid}`,
                            "arguments": {
                                "recipients": [`${userDetails.dataValues.email}`],
                                "headers": {
                                    "subject": `${passwordResetDetails.dataValues.project}` + ": Password Reset Request"
                                },
                                "template": `${passwordResetDetails.dataValues.template}`,
                                "variables": {
                                    "name": `${userDetails.dataValues.firstName + userDetails.dataValues.lastName}`,
                                    "resetlink": `${url}` + `${token}`
                                }
                            }
                        }
                    }, function(error, response) {
                        console.log(response.body)
                        if ((response.body.response.status !== 'unauthorized') && (response.body.response.status != 'bad_request') && (response.body.response.status !== 'precondition_failed')) {
                            if (response.body.data && response.body.data.message.status == 'queued') {
                                res.json({ success: true, data: 'Mail sent' });
                            } else {
                                res.json({ success: false, data: 'Mail not sent' });
                            }
                        } else {
                            res.json({ success: false, data: 'Mail not sent' });
                        }
                    });
                }).catch(next)
            }
        } else {
            res.json({ success: false, data: 'Invalid input' });
        }
    });
});

// reset password.

router.patch('/', function(req, res, next) {
    var decoded = jwt.verify(req.body.token, config.jwt.secret);
    let newData = {};
    let query = {};
    if (req.body.password && req.body.password.length) {
        newData.password = User.generateHash(req.body.password);
    }
    if (newData.errors) {
        return next(newData.errors[0]);
    }
    query.where = { userId: decoded.data.userId };
    User.update(newData, query).then(() => {
        res.json({ success: true });
    }).catch(next)
});

router.post('/check-answer', async function(req, res, next) {
    User.findOne({
        where: { userName: req.body.userName }
    }).then((user) => {
        User_SecurityQuestion_Answers.findOne({
            where: {
                userId: user.dataValues.userId,
                securityQuestionId: req.body.securityQuestionId,
            }
        }).then((answers) => {
            if (answers.dataValues.answer == req.body.answer) {
                User.update({ securityQuestionAnswered: Sequelize.literal('securityQuestionAnswered + ' + 1) }, {
                    where: { userId: user.dataValues.userId }
                }).then((data) => {
                    return res.json({ match: true });
                })
            } else {
                return res.json({ match: false });
            }
        }).catch(next)
    })
});

/*update postage Credencials */
router.put('/', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    SecurityQuestion.update(req.body, {
        where: { postageAppId: 1 }
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch(next);
})

/**get All security Questions */
router.get('/user/securityQuestions', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    User_SecurityQuestion_Answers.findAll({
        where: { userId: req.user.userId }
    }).then((data) => {
        let count = 0;
        data.forEach((element, index, array) => {
            SecurityQuestion.findOne({ where: { securityQuestionId: element.dataValues.securityQuestionId } }).then((securityQues) => {
                console.log(securityQues)
                element.dataValues.question = securityQues.dataValues.question
                if (count === array.length - 1) {
                    res.json({ success: true, data: data });
                }
                count++;
            });
        })
    }).catch((next) => {
        console.log(next)
    });
})

/*update securityQuestions Answers */

router.post('/user/update/securityQuestion', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    User_SecurityQuestion_Answers.findAll({
        where: { userId: req.user.userId }
    }).then((userQuestions) => {
        let x = [];
        userQuestions.forEach(element => {
            x.push(element.dataValues.User_securityQuestion_AnswerId)
        })
        User_SecurityQuestion_Answers.destroy({
            where: { User_securityQuestion_AnswerId: x }
        }).then((securityQuestion) => {
            req.body.securityQuestionData.map((element) => {
                element['userId'] = req.user.userId
            })
            User_SecurityQuestion_Answers.bulkCreate(req.body.securityQuestionData).then((data) => {
                res.json({ success: true, data: data });
            }).catch(next);
        }).catch(next);
    }).catch(next);
})

router.get('/user/userSecurityQuestions', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    User.findOne({
        include: [{
            model: SecurityQuestion,
            through: { attributes: [] }
        }, ],
        where: { userId: req.user.userId }
    }).then(userDetails => {
        res.json({ success: true, data: userDetails });
    })
})

router.post('/update/SecurityQuestion', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    console.log(req.body)
    User_SecurityQuestion_Answers.update({ securityQuestionId: req.body.securityQuestionId, answer: req.body.answer }, { where: { securityQuestionId: req.body.previousSecurityId, userId: req.user.userId } }).then((question) => {
        res.json({ success: true, data: question });
    }).catch(next)
})

//update security Question


module.exports = router;