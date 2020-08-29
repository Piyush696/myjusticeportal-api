const express = require('express');
const router = express.Router();
var passport = require('passport');
const User = require('../models').User;
const Facility = require('../models').Facility;

// create Facility

router.post('/', function (req, res, next) {
    Facility.create(req.body).then(facility => {
        res.json({ success: true, data: facility });
    }).catch(next)
})

// get all Facility

router.get('/', function (req, res, next) {
    Facility.findAll().then(data => {
        res.json({ success: true, data: data });
    })
})

// udate facility

router.put('/:facilityId', function (req, res, next) {
    Facility.update(req.body, { where: { facilityId: req.params.facilityId } }).then(data => {
        res.json({ success: true, data: data });
    })
})

router.delete('/:facilityId', function (req, res, next) {
    Facility.destroy({ where: { facilityId: req.params.facilityId } }).then(data => {
        res.json({ success: true, data: data });
    })
})

module.exports = router;