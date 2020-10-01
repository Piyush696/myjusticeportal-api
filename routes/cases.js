const express = require('express');
const router = express.Router();
var passport = require('passport');
const Case = require('../models').Case;
const User = require('../models').User;
const Files = require('../models').Files;
const util = require('../utils/validateUser');
const utils = require('../utils/validation')

router.post('/', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            req.body['userId'] = req.user.userId;
            Case.create(req.body).then(data => {
                res.json({ success: true, data: data });
            }).catch(next => {
                utils.validator(next, function (err) {
                    res.status(400).json(err)
                })
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

/* get cases for user. */

router.get('/', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Case.findAll({
                include: [
                    {
                        model: User, as: 'inmate',
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    }
                ],
                where: { userId: req.user.userId }
            }).then(data => {
                res.json({ success: true, data: data });
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// find case with caseId.

router.get('/:caseId', function (req, res, next) {
    console.log(req.params)
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Case.findOne({
                include: [
                    {
                        model: User, as: 'inmate',
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    },
                    {
                        model: Files, as: 'caseFile',
                        attributes: ['fileId', 'fileName', 'fileType', 'createdAt', 'updatedAt', 'createdByUserId'],
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
            }).catch((next) => {
                console.log(next)
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

/* edit case. */

router.put('/:caseId', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Case.update(req.body, { where: { caseId: req.params.caseId } }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next => {
                utils.validator(next, function (err) {
                    res.status(400).json(err)
                })
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

module.exports = router; 