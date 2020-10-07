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
            Case.findAll({
                where: { userId: req.user.userId }
            }).then(data => {
                let caseIds = data.map(x => x.caseId)
                Lawyer_case.findAll({
                    where: { caseId: caseIds, status: 'Approved' }
                }).then((cases) => {
                    let lawyerIds = cases.map(x => x.lawyerId)
                    User.findAll({
                        where: { userId: lawyerIds },
                        attributes: ['userId', 'firstName', 'lastName', 'userName']
                    }).then((hiredLawyers) => {
                        res.json({ success: true, data: hiredLawyers });
                    })
                })
            })
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

// get old messsged user.
router.get('/oldUser', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Message.findAll({
                where: {
                    $or: [{ senderId: req.user.userId }, { receiverId: req.user.userId }],
                },
            }).then(data => {
                let uniqueUsers = data.filter((v, i, a) => a.findIndex(t => ((t.receiverId === v.receiverId && t.senderId === v.senderId))) === i)
                let userIds = uniqueUsers.map(x => x.senderId && x.receiverId)
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }
                var uniqueIds = userIds.filter(onlyUnique);
                uniqueIds = uniqueIds.filter(x => {
                    return x !== req.user.userId
                })
                console.log(uniqueIds)
                User.findAll({
                    where: {
                        userId: uniqueIds,
                    },
                    attributes: ['userId', 'firstName', 'lastName', 'userName']
                }).then((users) => {
                    res.json({ success: true, data: users });
                })
            }).catch((next) => {
                console.log(next)
            })
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})


module.exports = router;