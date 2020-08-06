const express = require('express');
const router = express.Router();
var passport = require('passport');
const Case = require('../models').Case;
const User = require('../models').User;

/* create case. */
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    req.body['userId'] = req.user.userId
    Case.create(req.body).then(data => {
        res.json({ success: true, data: data });
    })
})


/* get cases for user. */
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Case.findAll({
        include: [
            {
                model: User,
            }
        ],
        where: { userId: req.user.userId }
    }).then(data => {
        res.json({ success: true, data: data });
    })
})

//find case with caseId
router.get('/case/:caseId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Case.findAll({
        include: [
            {
                model: User,
            }
        ],
        where: { caseId: req.params.caseId }
    }).then(data => {
        res.json({ success: true, data: data });
    })
})

module.exports = router;