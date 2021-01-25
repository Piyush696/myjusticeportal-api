const express = require('express');
const router = express.Router();
var passport = require('passport');
const Case = require('../models').Case;
const User = require('../models').User;
const Files = require('../models').Files;
const Facility = require('../models').Facility;
const util = require('../utils/validateUser');
const utils = require('../utils/validation');
const Organization = require('../models').Organization;
const Address = require('../models').Address;
const Lawyer_case = require('../models').lawyer_case;
const UserAdditionalInfo = require("../models").UserAdditionalInfo;

router.post('/', function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            req.body['userId'] = req.user.userId;
            Case.create(req.body).then(data => {
                res.json({ success: true, data: data });
            }).catch(next => {
                utils.validator(next, function(err) {
                    res.status(400).json(err)
                })
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

/* get cases for user. */

router.get('/', function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
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
                        attributes: ['userId'],
                        through: { attributes: ['status'] }
                    }
                ],
                where: { userId: req.user.userId }
            }).then(data => {
                res.json({ success: true, data: data });
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

/** */
router.get('/getPendingCaseInfo', function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Case.findAll({
                include: [{
                    model: User,
                    as: 'lawyer',
                    attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName'],
                    include: [{
                        model: Organization,
                        attributes: ['name']
                    }],
                }],
                attributes: ['caseId', 'legalMatter', 'briefDescriptionOfChargeOrLegalMatter'],
                where: { userId: req.user.userId }
            }).then(data => {
                let userAssignedLawyerCase = data.filter(x => x.lawyer.length > 0 && x.lawyer[0].lawyer_case.status != 'Connected')
                res.json({ success: true, data: userAssignedLawyerCase });
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

//requested case with caseId
router.get('/assignedCase/:caseId', function(req, res, next) {
    util.validate([1, 3, 5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Case.findOne({
                include: [{
                        model: User,
                        as: 'lawyer',
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    },
                    {
                        model: User,
                        as: 'inmate',
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    },
                    {
                        model: Files,
                        as: 'caseFile',
                        attributes: ['fileId', 'fileName', 'fileType', 'createdAt', 'updatedAt', 'createdByUserId'],
                        include: [{
                            model: User,
                            as: 'createdBy',
                            attributes: ['userId', 'firstName', 'lastName', 'userName']
                        }]
                    },
                ],
                where: { caseId: req.params.caseId },
                attributes: ['caseId', 'legalMatter', 'countyOfArrest', 'stateOfArrest', 'dateOfArrest', 'otherInformation', 'nextCourtDate', 'briefDescriptionOfChargeOrLegalMatter']
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch((next) => {
                console.log(next)
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// find case with caseId.

router.get('/:caseId', function(req, res, next) {
    util.validate([1, 3, 5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Case.findOne({
                include: [{
                        model: User,
                        as: 'inmate',
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    },
                    {
                        model: Files,
                        as: 'caseFile',
                        attributes: ['fileId', 'fileName', 'fileType', 'createdAt', 'updatedAt', 'createdByUserId'],
                        include: [{
                            model: User,
                            as: 'createdBy',
                            attributes: ['userId', 'firstName', 'lastName', 'userName']
                        }]
                    }
                ],
                where: { caseId: req.params.caseId }
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

/* edit case. */

router.put('/:caseId', function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Case.update(req.body, { where: { caseId: req.params.caseId } }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next => {
                utils.validator(next, function(err) {
                    res.status(400).json(err)
                })
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

router.get('/state/userFacility', function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({
                include: [{
                    model: Facility,
                    through: { attributes: [] },
                    include: [{
                        model: Address
                    }]
                }],
                where: { userId: req.user.userId }
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})



router.get('/lawyer-case/:caseId', function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_case.findOne({
                where: {
                    $or: [{ caseId: req.params.caseId, status: 'Connected' }, { caseId: req.params.caseId, status: 'Connected' }],
                },
                // where: { caseId: req.params.caseId, status: 'Approved' }
                // attributes: ['userId']
            }).then((lawyerCase) => {
                if (lawyerCase) {
                    User.findOne({
                        include: [{
                            model: Organization,
                            attributes: ['organizationId', 'name']
                        }, {

                            model: UserAdditionalInfo,
                            include: [{
                                model: Files,
                                as: "profile",
                            }, ],

                        }],
                        where: { userId: lawyerCase.lawyerId },
                        attributes: ['userId', 'firstName', 'middleName', 'lastName']
                    }).then((user) => {
                        res.json({ success: true, data: user });
                    })
                } else {
                    res.json({ success: true, data: 'No lawyer assigned to this case.' });
                }

            });
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})

//get all cases for lawyer
router.get('/lawyer/allCases', function(req, res, next) {
    util.validate([3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_case.findAll({
                where: {
                    $or: [{ status: 'Connected' }, { status: 'Disconnected' }],
                    lawyerId: req.user.userId
                },
                // where: { lawyerId: req.user.userId,status: }
            }).then((foundLawyerCases) => {
                let caseIds = foundLawyerCases.map(data => data.caseId);
                User.findOne({
                    include: [{
                        model: Case,
                        as: 'lawyer',
                        where: { caseId: caseIds },
                        include: [{
                                model: Files,
                                as: 'caseFile',
                                attributes: ['fileId', 'fileName', 'createdAt', 'updatedAt', 'createdByUserId']
                            },
                            {
                                model: User,
                                as: 'inmate',
                                attributes: ['userId', 'firstName', 'middleName', 'lastName']
                            }
                        ]
                    }],
                    where: { userId: req.user.userId },
                    attributes: ['userId']
                }).then((caseData) => {
                    res.json({ success: true, data: caseData });
                });
            });
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})

module.exports = router;