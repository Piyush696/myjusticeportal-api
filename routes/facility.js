const express = require('express');
const router = express.Router();
var passport = require('passport');
const User = require('../models').User;
const Facility = require('../models').Facility;
const Address = require('../models').Address
const utils = require('../utils/validation');


// create Facility

router.post('/', function (req, res, next) {
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
})

// get all Facility

router.get('/', function (req, res, next) {
    Facility.findAll({
        include: [
            {
                model: Address
            }
        ]
    }).then(data => {
        res.json({ success: true, data: data });
    })
})


// udate facility

router.put('/:facilityId', function (req, res, next) {
    Facility.update(req.body.facility, { where: { facilityId: req.params.facilityId } }).then(() => {
        Address.update(req.body.facilityAddress, { where: { addressId: req.body.facilityAddressId } }).then((data) => {
            res.json({ success: true, data: data });
        })
    }).catch(next => {
        utils.validator(next, function (err) {
            res.status(400).json(err)
        })
    });
})

router.delete('/:facilityId', function (req, res, next) {
    Facility.destroy({ where: { facilityId: req.params.facilityId } }).then(data => {
        res.json({ success: true, data: data });
    })
})

// check facility code

router.get('/facilityCode/check/:code?', async function (req, res, next) {
    Facility.findAndCountAll({
        where: { facilityCode: req.params.code }
    }).then((facility) => {
        if (facility.count == 0) {
            return res.json({ taken: false });
        }
        return res.json({ taken: true });
    }).catch(next);
});

module.exports = router;