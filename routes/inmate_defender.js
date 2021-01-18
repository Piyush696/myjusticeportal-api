const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Case = require('../models').Case;
const Organization = require('../models').Organization;
const inmate_defender = require("../models").inmate_defender;
const util = require("../utils/validateUser");
const utils = require('../utils/validation');

router.get('/', function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({
                include: [{
                    model: Organization,
                    attributes: ["organizationId"],
                    include: [{
                        model: User,
                        attributes: ["userId", "firstName", "middleName", "lastName"],
                    }]
                }],
                attributes: ["userId"],
                where: { userId: req.user.userId }
            }).then(user => {
                res.json({ success: true, data: user });
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    })
})


router.get('/allInmateAssignedCases', function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({
                attributes: ["userId"],
                where: { userId: req.user.userId },
                include: [{
                    model: User,
                    as: "publicdefender",
                }]
            }).then(user => {
                let userIds = user.publicdefender.map(data => data.userId);
                Case.findAll({
                    include: [{
                        model: User,
                        as: 'inmate',
                        attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName'],
                        where: { userId: userIds },
                    }],
                    attributes: ['caseId', 'briefDescriptionOfChargeOrLegalMatter', 'legalMatter', 'otherInformation', 'updatedAt']
                }).then(cases => {
                    res.json({ success: true, data: cases });
                }).catch(next)
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    })
})

router.post('/', function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            inmate_defender.create(req.body).then((user) => {
                res.json({ success: true, data: user });
            }).catch(next => {
                utils.validator(next, function(err) {
                    res.status(400).json(err)
                })
            })
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    })
})

module.exports = router;