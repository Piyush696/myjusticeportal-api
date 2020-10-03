const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Message = require('../models').Messages;
const util = require('../utils/validateUser');
const Facility = require('../models').Facility;
const Organization = require('../models').Organization;
const Lawyer_case = require('../models').lawyer_case;
const Address = require('../models').Address;
const Case = require('../models').Case;

// get messaged user of sender.
router.get('/', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({
                include: [
                    {
                        model: Facility, through: { attributes: [] }, attributes: ['facilityId'],
                        include: [
                            {
                                model: Organization, through: { attributes: [] }, attributes: ['organizationId', 'name', 'orgCode', 'type'],
                                where: { type: 'lawyer' },
                                include: [
                                    {
                                        model: User, attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt']
                                    },
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
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})




// get history messages of user.
router.get('/allMessages/:receiverId', function (req, res, next) {
    util.validate([1, 3], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Message.findAll({
                where: {
                    $or: [{ senderId: req.user.userId, receiverId: req.params.receiverId }, { senderId: req.params.receiverId, receiverId: req.user.userId, }],
                },
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})

// get all users for lawyer.
router.get('/users', function (req, res, next) {
    util.validate([3], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_case.findAll({
                where: { lawyerId: req.user.userId, status: 'Approved' },
            }).then(data => {
                let caseIds = data.map(x => x.caseId)
                Case.findAll({
                    include: [
                        {
                            model: User, as: 'inmate',
                            attributes: ['userId', 'firstName', 'lastName', 'userName']
                        }
                    ],
                    where: { caseId: caseIds },
                }).then((cases) => {
                    let inmate = [];
                    let count = 0;
                    cases.forEach((element, index, Array) => {
                        inmate.push(element.inmate)
                        if (count === Array.length - 1) {
                            inmate = inmate.filter((v, i, a) => a.findIndex(t => (t.userId === v.userId)) === i)
                            res.json({ success: true, data: inmate })
                        }
                        count++
                    });
                }).catch(next)
            }).catch(next)
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})

module.exports = router;