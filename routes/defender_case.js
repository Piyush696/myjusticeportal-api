const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Case = require('../models').Case;
const Facility = require('../models').Facility;
const Organization = require('../models').Organization;
const lawyer_case = require("../models").lawyer_case;
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
                        as: 'inmate',
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    },
                    {
                        model: User,
                        as: 'lawyer',
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
            lawyer_case.findAll({
                where: { lawyerId: req.user.userId },
            }).then(user => {
                let caseIds = user.map(data => data.caseId);
                Case.findAll({
                    include: [{
                        model: User,
                        as: 'inmate',
                        attributes: ['userId', 'firstName', 'middleName', 'lastName'],
                    }],
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
    console.log(req.body)
    let x = {
        "lawyerId": req.body.publicdefenderId,
        "caseId": req.body.caseId,
        "status": 'Connected',
        "notes": ''
    }
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            lawyer_case.create(x).then((lawyer_case) => {
                res.json({ success: true, data: lawyer_case });
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

//get user for lawyer
router.get('/allUser', function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            lawyer_case.findAll({
                where: { lawyerId: req.user.userId },
            }).then(user => {
                let caseIds = user.map(data => data.caseId);
                Case.findAll({
                    include: [{
                        model: User,
                        as: 'inmate',
                        attributes: ['userId', 'firstName', 'middleName', 'lastName'],
                    }],
                    attributes: ['caseId'],
                    where: { caseId: caseIds }
                }).then(cases => {
                    let connectedInmates = [];
                    let filteredInmates = cases.map(x => x.inmate)
                    connectedInmates = filteredInmates.filter((v, i, a) => a.findIndex(t => (t.userId === v.userId)) === i)
                    res.json({ success: true, data: connectedInmates });
                }).catch(next)
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    })
})

module.exports = router;