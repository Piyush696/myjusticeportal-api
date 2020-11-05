const express = require('express');
const router = express.Router();
const Case = require('../models').Case;
const User = require('../models').User;
const util = require('../utils/validateUser');
const Facility = require('../models').Facility;
const Lawyer_case = require('../models').lawyer_case;




// To get all approved cases user.

router.get('/users', function (req, res, next) {
    util.validate([3], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            console.log('foundLawyerCases')
            console.log(req.user.userId)
            Lawyer_case.findAll({
                where: { status: 'Approved', lawyerId: req.user.userId }
            }).then((foundLawyerCases) => {
                let caseIds = foundLawyerCases.map(data => data.caseId);
                User.findOne({
                    include: [
                        {
                            model: Case, as: 'lawyer', attributes: ['caseId'],
                            where: { caseId: caseIds },
                            include: [
                                {
                                    model: User, as: 'inmate',
                                    attributes: ['userId', 'firstName', 'middleName', 'lastName'],
                                    include: [
                                        {
                                            model: Facility, through: { attributes: [] }, attributes: ['facilityId', 'facilityName'],
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    where: { userId: req.user.userId },
                    attributes: ['userId']
                }).then((caseData) => {
                    let uniqueUsers = caseData.dataValues.lawyer.filter((v, i, a) => a.findIndex(t => ((t.inmate.userId === v.inmate.userId))) === i)
                    let inmates = uniqueUsers.map(data => data.inmate)
                    res.json({ success: true, data: inmates });
                }).catch(next);
            }).catch(next);
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})

router.post('/:caseId', function (req, res, next) {
    console.log(req.params, req.body.lawyerId)
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_case.destroy({ where: { lawyerId: req.body.lawyerId, caseId: req.params.caseId } }).then((data) => {
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
module.exports = router; 