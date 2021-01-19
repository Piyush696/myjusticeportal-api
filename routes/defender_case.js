const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Case = require('../models').Case;
const Facility = require('../models').Facility;
const Organization = require('../models').Organization;
const defender_case = require("../models").defender_case;
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

router.get('/allCases/:userId', function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Case.findAll({
                include: [{
                        model: User,
                        as: 'publicdefender',
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    },
                    {
                        model: User,
                        as: 'inmate',
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    }
                ],
                where: { userId: req.params.userId }
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


router.get('/allInmateAssignedCases', function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            defender_case.findAll({
                where: { publicdefenderId: req.user.userId },
            }).then(user => {
                let caseIds = user.map(data => data.caseId);
                Case.findAll({
                    attributes: ['caseId', 'briefDescriptionOfChargeOrLegalMatter', 'legalMatter', 'otherInformation', 'updatedAt'],
                    where: { caseId: caseIds }
                }).then(cases => {
                    res.json({ success: true, data: cases });
                }).catch(next)
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    })
})

router.get('/allDefenderFacility', function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findAll({
                include: [{
                    model: Facility,
                    as: 'defender',
                    attributes: ['facilityId', 'facilityName']
                }],
                where: { userId: req.user.userId },
                attributes: ['userId']
            }).then((facilityList) => {
                res.json({ success: true, data: facilityList[0].defender });
            })
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    })
})

router.post('/', function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            defender_case.create(req.body).then((user) => {
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