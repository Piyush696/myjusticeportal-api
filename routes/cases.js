const express = require('express');
const router = express.Router();
var passport = require('passport');
const Case = require('../models').Case;
const User = require('../models').User;
const Files = require('../models').Files;
/* create case. */

router.post('/', function (req, res, next) {
    req.body['userId'] = req.user.userId;
    Case.create(req.body).then(data => {
        res.json({ success: true, data: data });
    })
})

/* get cases for user. */

router.get('/', function (req, res, next) {
    Case.findAll({
        include: [
            {
                model: User, attributes: ['userId', 'firstName', 'lastName', 'userName']
            }
        ],
        where: { userId: req.user.userId }
    }).then(data => {
        res.json({ success: true, data: data });
    })
})

// find case with caseId.

router.get('/:caseId', function (req, res, next) {
    Case.findOne({
        include: [
            {
                model: User, attributes: ['userId', 'firstName', 'lastName', 'userName']
            },
            {
                model: Files, as: 'caseFile',
                include: [
                    {
                        model: User, as: 'createdBy',
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    }
                ]
            }
        ],
        where: { caseId: req.params.caseId }
    }).then(data => {
        res.json({ success: true, data: data });
    })
})

/* edit case. */

router.put('/:caseId', function (req, res, next) {
    Case.update(req.body, { where: { caseId: req.params.caseId } }).then(data => {
        res.json({ success: true, data: data });
    })
})


module.exports = router;