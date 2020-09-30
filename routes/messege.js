const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Message = require('../models').Messages;
const util = require('../utils/validateUser');

// get messaged user of sender.
router.get('/', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Message.findAll({
                include: [
                    {
                        model: User, as: 'receiver', attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt']
                    }
                ],
                where: { senderId: req.user.userId },
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch((next) => {
                console.log(next)
            })
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})


// get history messages of user.
router.get('/messages', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Message.findAll({
                where: {
                    $or: [{ senderId: 7, receiverId: 8 }, { senderId: 8, receiverId: 7, }],

                },
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch((next) => {
                console.log(next)
            })
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})

module.exports = router;