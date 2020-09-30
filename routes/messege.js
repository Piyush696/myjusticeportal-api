const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Message = require('../models').Messages;
const util = require('../utils/validateUser');
const Facility = require('../models').Facility;
const Organization = require('../models').Organization;
const Address = require('../models').Address;

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
router.get('/messages', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Message.findAll({
                where: {
                    $or: [{ senderId: 7, receiverId: 8 }, { senderId: 8, receiverId: 7, }],
                },
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})

module.exports = router;