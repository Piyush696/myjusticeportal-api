const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Organization = require('../models').Organization;
const Address = require('../models').Address;
const util = require('../utils/validateUser');

//list of all organizations role is bondsman.
router.get('/', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Organization.findAll({
                include: [
                    {
                        model: Address
                    }
                ],
                attributes: ['organizationId', 'name', 'orgCode', 'type'],
                where: { type: 'bondsman' },
            }).then((organizations) => {
                res.json({ success: true, data: organizations });
            }).catch((next) => {
                console.log(next)
            })
        } else {
            res.json({ success: true, data: 'Unauthorized user.' });
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