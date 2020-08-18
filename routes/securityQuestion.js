const express = require('express');
const router = express.Router();
var passport = require('passport');
const SecurityQuestion = require('../models').SecurityQuestion;
const User = require('../models').User;
const { Sequelize } = require("sequelize");
const securityQuestion = require('../models/securityQuestion');
const User_SecurityQuestion_Answers = require('../models').User_SecurityQuestion_Answers;


router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User_SecurityQuestion_Answers.findOne({ where: { userId: req.user.userId, securityQuestionId: req.body.securityQuestionId } }).then(data => {
        if (data && data.securityQuestionId == req.body.securityQuestionId) {
            User_SecurityQuestion_Answers.update({ answer: req.body.answer }, { where: { userId: data.userId, securityQuestionId: data.securityQuestionId } }).then((data) => {
                res.json({ success: true, data: data });
            })
        }
        else {
            User_SecurityQuestion_Answers.create({
                securityQuestionId: req.body.securityQuestionId,
                answer: req.body.answer,
                userId: req.user.userId
            }).then(data => {
                res.json({ success: true, data: data });
            })
        }
    })
})

router.get('/:roleId', function (req, res, next) {
    SecurityQuestion.findAll({ where: { roleId: req.params.roleId } }).then(securityQuestion => {
        res.json({ success: true, data: securityQuestion });
    })
})


router.post('/securityQues', function (req, res, next) {
    User.findOne({
        include: [
            {
                model: SecurityQuestion, through: {
                    attributes: []
                },
            }
        ],
        where: {
            $or: [
                {
                    username: req.body.user
                },
                {
                    email: req.body.user
                }
            ],
        }
    }).then(user => {
        res.json({ success: true, data: user });
    })
})


router.post('/check-answer', async function (req, res, next) {
    User.findOne({
        where: {
            $or: [
                {
                    username: req.body.user
                },
                {
                    email: req.body.user
                }
            ],
        }
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
            }
            else {
                return res.json({ match: false });
            }
        }).catch(next)
    })
});

/*update postage Credencials */
router.put('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    SecurityQuestion.update(req.body, {
        where: { postageAppId: 1 }
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch(next);
})

/**get All security Questions */
router.get('/user/securityQuestions', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User_SecurityQuestion_Answers.findAll({
        where: { userId: req.user.userId }
    }).then((data) => {
        let count = 0;
        data.forEach((element, index, array) => {
            SecurityQuestion.findOne({ where: { securityQuestionId: element.dataValues.securityQuestionId } }).then((data1) => {
                element.dataValues.question = data1.dataValues.question
                if (count === array.length - 1) {
                    res.json({ success: true, data: data });
                }
                count++
            });
        })
    }).catch(next);
})


/*update securityQuestions Answers */
router.put('/securityQuestion', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User_SecurityQuestion_Answers.update(req.body, {
        where: { userId: req.user.userId, securityQuestionId: req.body.securityQuestionId }
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch(next);
})
module.exports = router;