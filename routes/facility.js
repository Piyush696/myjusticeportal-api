const express = require('express');
const router = express.Router();
var passport = require('passport');
const User = require('../models').User;
const Facility = require('../models').Facility;
const Address = require('../models').Address
const util = require('../utils/validateUser');


// create Facility

router.post('/', function (req, res, next) {
    util.validate([7], req.user.roles, function (isAuthenticated) {
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
                    ipAddress: fac.ipAddress,
                    libraryLink: fac.libraryLink,
                    addressId: addressData.addressId
                }).then(facility => {
                    res.json({ success: true, data: facility });
                }).catch(next => {
                    utils.validator(next, function (err) {
                        res.status(400).json(err)
                    })
                })
            }).catch(next => {
                utils.validator(next, function (err) {
                    res.status(400).json(err)
                })
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// get all Facility

router.get('/', function (req, res, next) {
    util.validate([7, 3], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Facility.findAll({
                include: [
                    {
                        model: Address
                    }
                ]
            }).then(data => {
                res.json({ success: true, data: data });
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// udate facility

router.put('/:facilityId', function (req, res, next) {
    util.validate([7], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Facility.update(req.body.facility, { where: { facilityId: req.params.facilityId } }).then(() => {
                Address.update(req.body.facilityAddress, { where: { addressId: req.body.facilityAddressId } }).then((data) => {
                    res.json({ success: true, data: data });
                })
            }).catch(next => {
                utils.validator(next, function (err) {
                    res.status(400).json(err)
                })
            });
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

router.delete('/:facilityId', function (req, res, next) {
    util.validate([7], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Facility.destroy({ where: { facilityId: req.params.facilityId } }).then(data => {
                res.json({ success: true, data: data });
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// check facility code

router.get('/facilityCode/check/:code?', async function (req, res, next) {
    util.validate([7], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Facility.findAndCountAll({
                where: { facilityCode: req.params.code }
            }).then((facility) => {
                if (facility.count == 0) {
                    return res.json({ taken: false });
                }
                return res.json({ taken: true });
            }).catch(next);
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
});

module.exports = router;