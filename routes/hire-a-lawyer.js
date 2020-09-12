const express = require('express');
const router = express.Router();

const User = require('../models').User;
const Facility = require('../models').Facility;
const Organization = require('../models').Organization;
const Address = require('../models').Address;
const Role = require('../models').Role
const Case = require('../models').Case;
const Lawyer_case = require('../models').lawyer_case;
const Files = require('../models').Files;
const utils = require('../utils/file');

//list of all organizations those who are linked to a facility and role is lawyer.
router.get('/users', function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Facility, through: { attributes: [] },
                include: [
                    {
                        model: Organization, through: { attributes: [] }, attributes: ['organizationId', 'name', 'orgCode', 'type'],
                        where: { type: 'lawyer' },
                        include: [
                            {
                                model: Address
                            }
                        ],
                    }
                ],
            }
        ],
        where: { userId: req.user.userId },
        attributes: ['userId'],
    }).then((user) => {
        res.json({ success: true, data: user.facilities[0].Organizations });
    })
})


// get users of organisation.
router.get('/users/:organizationId', function (req, res, next) {
    Organization.findOne({
        include: [
            {
                model: Address
            },
            {
                model: User, attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt'],
                include: [
                    {
                        model: Role, through: {
                            attributes: []
                        }
                    }
                ]
            }
        ],
        where: { organizationId: parseInt(req.params.organizationId) },
        attributes: ['organizationId', 'name']
    }).then(data => {
        res.json({ success: true, data: data });
    }).catch(next)
})


//set lawyer case
router.post('/', function (req, res, next) {
    req.body.caseIds.map((element) => {
        element['lawyerId'] = req.user.userId
        element['status'] = 'requested'
    })
    Lawyer_case.bulkCreate(req.body.caseIds).then((lawyerCases) => {
        res.json({ success: true, data: lawyerCases });
    })
})

// To get requested cases.

router.get('/requested-cases', function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Case, as: 'lawyer',
                include: [
                    {
                        model: Files, as: 'caseFile'
                    },
                    {
                        model: User, as: 'inmate',
                        attributes: ['userId', 'firstName', 'middleName', 'lastName']
                    }
                ]
            }
        ],
        where: { userId: req.user.userId },
        attributes: ['userId']
    }).then((caseData) => {
        res.json({ success: true, data: caseData });
    })
})

// To get requested cases.

router.get('/requested-cases/:caseId', function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Case, as: 'lawyer',
                include: [
                    {
                        model: Files, as: 'caseFile'
                    },
                    {
                        model: User, as: 'inmate',
                        attributes: ['userId', 'firstName', 'middleName', 'lastName']
                    }
                ],
                where: { caseId: req.params.caseId }
            }
        ],
        where: { userId: req.user.userId },
        attributes: ['userId']
    }).then((caseData) => {
        res.json({ success: true, data: caseData });
    })
})

// To get file DownloadLink.

router.post('/fileDownloadLink', function (req, res, next) {
    validateUtil.validate([1], req.user.role, function (isAuthenticated) {
        if (isAuthenticated) {
            Case.findOne({
                where: { userId: req.user.userId, caseId: req.body.caseId },
                attributes: ['caseId'],
                include: [
                    {
                        model: Files, as: 'caseFile',
                        where: { fileId: req.body.fileId }
                    }
                ]
            }).then((data) => {
                utils.getSingleSignedURL(data.caseFile[0], function (downloadLink) {
                    if (downloadLink) {
                        res.json({ success: true, data: downloadLink });
                    }
                })
            }).catch(next);
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

module.exports = router; 