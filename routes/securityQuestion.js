const express = require('express');
const router = express.Router();
var passport = require('passport');
const SecurityQuestion = require('../models').SecurityQuestion;
const User_SecurityQuestion_Answers = require('../models').User_SecurityQuestion_Answers;

// router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
//     SecurityQuestion.create(req.body).then(securityQuestion => {
//         res.json({ success: true, data: securityQuestion });
//     })
// })

router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User_SecurityQuestion_Answers.create({
        securityQuestionId: req.body.securityQuestionId,
        answer: req.body.answer,
        userId: req.user.userId
    }).then(data => {
        res.json({ success: true, data: data });
    })
})

router.get('/:roleId', function (req, res, next) {
    SecurityQuestion.findAll({ where: { roleId: req.params.roleId } }).then(securityQuestion => {
        res.json({ success: true, data: securityQuestion });
    })
})

module.exports = router;