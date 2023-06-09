const express = require('express');
const router = express.Router();
const request = require('request');
const User = require('../models').User;
const Message = require('../models').Messages;
const util = require('../utils/validateUser');
const Facility = require('../models').Facility;
const Organization = require('../models').Organization;
const Lawyer_case = require('../models').lawyer_case;
const Address = require('../models').Address;
const Case = require('../models').Case;
const Role = require('../models').Role;
const Postage = require('../models').Postage;
const CronJob = require('cron').CronJob;
const uuidv1 = require('uuid/v1');

// get messaged user of sender.
router.get('/', function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Case.findAll({
                where: { userId: req.user.userId }
            }).then(data => {
                let caseIds = data.map(x => x.caseId)
                Lawyer_case.findAll({
                    where: { caseId: caseIds, status: 'approved' }
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
router.get('/allMessages/:receiverId', function(req, res, next) {
    util.validate([1, 3, 5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Message.findAll({
                where: {
                    $or: [{ senderId: req.user.userId, receiverId: req.params.receiverId }, { senderId: req.params.receiverId, receiverId: req.user.userId, }],
                },
                order: [
                    ['createdAt', 'ASC']
                ]
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})

// get all users for lawyer.
router.get('/users', function(req, res, next) {
    util.validate([3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_case.findAll({
                where: { lawyerId: req.user.userId, status: 'Connected' },
            }).then((data) => {
                if (data) {
                    let caseIds = data.map(x => x.caseId)
                    Case.findAll({
                        include: [{
                            model: User,
                            where: { status: true },
                            as: 'inmate',
                            attributes: ['userId', 'firstName', 'lastName', 'middleName', 'userName']
                        }],
                        where: { caseId: caseIds },
                        attributes: ['caseId']
                    }).then((users) => {
                        let connectedInmates = [];
                        let filteredInmates = users.map(x => x.inmate)
                        connectedInmates = filteredInmates.filter((v, i, a) => a.findIndex(t => (t.userId === v.userId)) === i)
                        res.json({ success: true, data: connectedInmates })
                    }).catch(next)
                } else {
                    res.json({ success: false, data: 'No data found.' });
                }

            }).catch(next)
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})


// get old messsged user.
router.get('/connectedLawyers', function(req, res, next) {
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
                        },
                        {
                            model: Role,
                            through: { attributes: [] },
                            attributes: ["roleId"]
                        }
                    ],
                }, ],
                attributes: ['caseId'],
                where: { userId: req.user.userId }
            }).then((data) => {
                let allLawyers = [];

                data.forEach((element) => {
                    element.lawyer.forEach((ele) => {
                        if (ele.lawyer_case.status === 'Connected') {
                            let x = {}
                            x['userId'] = ele.userId;
                            x['firstName'] = ele.firstName;
                            x['middleName'] = ele.middleName;
                            x['lastName'] = ele.lastName;
                            x['userName'] = ele.userName;
                            if (ele.roles[0].roleId === 3) {
                                x['role'] = 'Lawyer';
                            } else {
                                x['role'] = 'Defender';
                            }
                            allLawyers.push(x)
                        }
                    })
                });
                lawyers = allLawyers.filter((v, i, a) => a.findIndex(t => (t.userId === v.userId)) === i)
                res.json({ success: true, data: lawyers });
            }).catch(next)
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})


// to get last user with whom we texted

router.get('/allMessages', function(req, res, next) {
    util.validate([1, 3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Message.findAll({
                order: [
                    ['createdAt', 'DESC']
                ]
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})


// router.get('/allMessages', function (req, res, next) {
//     util.validate([1, 3], req.user.roles, function (isAuthenticated) {
//         if (isAuthenticated) {
//             Message.findAll({
//                 order: [
//                     ['createdAt', 'DESC']
//                 ]
//             }).then(data => {
//                 res.json({ success: true, data: data });
//             }).catch(next)
//         } else {
//             res.json({ success: true, data: 'Unauthorized user.' });
//         }
//     })
// })

// var job = new CronJob('* * * * * *', function () {
//     Message.findAll({
//         include: [
//             {
//                 model: User, as: 'receiver',
//                 attributes: ['userId', 'firstName', 'lastName', 'middleName', 'userName']
//             }
//         ],
//         where: { isRead: false },
//     }).then(data => {
//         data.filter(res => {
//             if (res.emailSend == false) {
//                 updateTime = res.updatedAt.toLocaleString();
//                 currentTime = new Date(new Date().getTime() - 6 * 60 * 60 * 1000).toLocaleString();
//                 if (updateTime == currentTime) {
//                     let uuid = uuidv1();
//                     Postage.findOne({ where: { postageAppId: 1 } }).then((postageDetails) => {
//                         request.post({
//                             headers: { 'content-type': 'application/json' },
//                             url: `${postageDetails.dataValues.apiUrl}`,
//                             json: {
//                                 "api_key": `${postageDetails.dataValues.apiKey}`,
//                                 "uid": `${uuid}`,
//                                 "arguments": {
//                                     "recipients": [`${res.receiver.userName}`],
//                                     "headers": {
//                                         "subject": `${postageDetails.dataValues.project}` + ": Message Notification"
//                                     },
//                                     "template": "unread_message_notification",
//                                     "variables": {
//                                         "name": `${res.receiver.firstName + ' ' + res.receiver.middleName + ' ' + res.receiver.lastName}`,
//                                     }
//                                 }
//                             }
//                         },
//                         );
//                     })
//                 }
//             }
//         })
//     })
// }, null, true, 'America/Los_Angeles');
// job.start();


// storing the messages sent from the modal

router.post('/createMessage', function(req, res, next) {
    const data = {
        "message": req.body.message,
        "senderId": req.body.senderId,
        "receiverId": req.body.receiverId
    }
    Message.create(data).then((msg) => {
        res.json({ success: true, data: 'Message Sent' })
    }).catch(next)
})

module.exports = router;