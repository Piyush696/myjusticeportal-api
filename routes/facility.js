const express = require('express');
const router = express.Router();
var passport = require('passport');
const User = require('../models').User;
const Facility = require('../models').Facility;
const Address = require('../models').Address
const util = require('../utils/validateUser');
const utils = require('../utils/validation');
const Sequelize = require('sequelize');
const Lawyer_Facility = require("../models").lawyer_facility;
const user_facility = require("../models").user_facility;

// create Facility

router.post('/', function(req, res, next) {
    util.validate([7], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            let address = req.body.facilityAddress
            let fac = req.body.facility
            Address.create({
                street1: address.street1,
                street2: address.street2,
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country
            }).then(addressData => {
                Facility.create({
                    facilityCode: fac.facilityCode,
                    facilityName: fac.facilityName,
                    facilityUserCount: fac.facilityUserCount,
                    ipAddress: fac.ipAddress,
                    libraryLink: fac.libraryLink,
                    addressId: addressData.addressId
                }).then(facility => {
                    res.json({ success: true, data: facility });
                }).catch(next => {
                    utils.validator(next, function(err) {
                        res.status(400).json(err)
                    })
                })
            }).catch(next => {
                utils.validator(next, function(err) {
                    res.status(400).json(err)
                })
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// get all Facility

router.get('/', function(req, res, next) {
    util.validate([7, 3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Facility.findAll({
                include: [{
                    model: Address
                }]
            }).then(data => {
                res.json({ success: true, data: data });
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// udate facility

router.put('/:facilityId', function(req, res, next) {
    util.validate([7], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Facility.update(req.body.facility, { where: { facilityId: parseInt(req.params.facilityId) } }).then(() => {
                Address.update(req.body.facilityAddress, { where: { addressId: parseInt(req.body.facilityAddressId) } }).then((data) => {
                    res.json({ success: true, data: data });
                }).catch(next)
            }).catch(next => {
                utils.validator(next, function(err) {
                    res.status(400).json(err)
                })
            });
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

router.delete('/:facilityId', function(req, res, next) {
    util.validate([7], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Facility.destroy({ where: { facilityId: req.params.facilityId } }).then(data => {
                res.json({ success: true, data: data });
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// check facility code

router.get('/facilityCode/check/:code?', async function(req, res, next) {
    util.validate([7], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Facility.findAndCountAll({
                where: { facilityCode: req.params.code }
            }).then((facility) => {
                if (facility.count == 0) {
                    return res.json({ taken: false });
                }
                return res.json({ taken: true });
            }).catch(next);
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
});


router.get('/facility/userCount', function(req, res, next) {
    Facility.findAll({
        include: [{
            model: Address
        }],
    }).then((result) => {
        res.json({ success: true, data: result });
    }).catch(next);
})

router.get('/planSelectedFaciltiy', function(req, res, next) {
    Lawyer_Facility.findAll({
        attributes: ["planSelected"],
        where: { lawyerId: req.user.userId }
    }).then(data => {
        res.json({ success: true, data: data });
    }).catch(next)
})


router.get('/users/all-users', function(req, res, next) {
    User.findOne({
        include: [{
            model: Facility,
            through: {
                attributes: ['facilityId'],
            },
            as: 'facility',
            attributes: ['facilityId'],
            include: [{
                model: User,
                attributes: ["userId", "firstName", "middleName", "lastName", "userName", "mobile", "email"],
            }]
        }],
        attributes: ["userId"],
        where: { userId: req.user.userId }
    }).then((result) => {
        res.json({ success: true, data: result.facility[0].users });
    }).catch((next) => {
        console.log(next)
    });
})

module.exports = router;