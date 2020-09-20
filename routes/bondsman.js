const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Organization = require('../models').Organization;
const Address = require('../models').Address;
const Role = require('../models').Role
const utils = require('../utils/file');
const validateUtil = require('../utils/validateUser');

//list of all organizations role is bondsman.
router.get('/', function (req, res, next) {
    console.log(req.user.userId)
    User.findOne({
        include: [
            {
                model: Organization, attributes: ['organizationId', 'name', 'orgCode', 'type'],
                where: { type: 'bondsman' },
                include: [
                    {
                        model: Address
                    }
                ],
            }
        ],
        where: { userId: req.user.userId },
        attributes: ['userId'],
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch((next) => {
        console.log(next)
    })
})

// get users of organisation.
router.get('/:organizationId', function (req, res, next) {
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
})

module.exports = router;