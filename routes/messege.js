const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Message = require('../models').Messages;
const util = require('../utils/validateUser');

// get messaged user of sender.
router.get('/', function (req, res, next) {
    console.log('wkkd')
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
router.get('/messages/:receiverId', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Message.findAll({
                where: {
                    $or: [{ senderId: req.user.userId, receiverId: req.params.receiverId }, { senderId: req.params.receiverId, receiverId: req.user.userId, }],

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