const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Organization = require('../models').Organization;
const Address = require('../models').Address;
const util = require('../utils/validateUser');
const Facility = require('../models').Facility;


//list of all organizations those who are linked to a facility and role is bondsman.
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
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// get users of organisation.
router.get('/:organizationId', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Organization.findOne({
                include: [
                    {
                        model: Address
                    },
                    {
                        model: User, attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt']
                    }
                ],
                where: { organizationId: parseInt(req.params.organizationId) },
                attributes: ['organizationId', 'name']
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
        }
    })
})

module.exports = router;