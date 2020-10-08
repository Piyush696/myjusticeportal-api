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
                    res.json({ success: true, data: uniqueUsers });
                }).catch(next);
            }).catch(next);
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})
module.exports = router; 