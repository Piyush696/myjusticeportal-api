const express = require('express');
const router = express.Router();
var passport = require('passport');
const SecurityQuestion = require('../models').SecurityQuestion;
const User_SecurityQuestion_Answers = require('../models').User_SecurityQuestion_Answers;


router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    console.log(req.body)
    User_SecurityQuestion_Answers.findOne({ where: { userId: req.user.userId, securityQuestionId: req.body.securityQuestionId } }).then(data => {
        if (data && data.securityQuestionId == req.body.securityQuestionId) {
            console.log('update')
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

module.exports = router;