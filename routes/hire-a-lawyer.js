const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Facility = require('../models').Facility;
const Organization = require('../models').Organization;
const Address = require('../models').Address;
const Role = require('../models').Role


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

module.exports = router; 