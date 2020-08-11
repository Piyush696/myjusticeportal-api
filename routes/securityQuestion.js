const express = require('express');
const router = express.Router();
var passport = require('passport');
const SecurityQuestion = require('../models').SecurityQuestion;
/* Get user by ID or users list. */

router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    SecurityQuestion.create(req.body).then(securityQuestion => {
        res.json({ success: true, data: securityQuestion });
    })
})

module.exports = router;