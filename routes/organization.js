const express = require('express');
const router = express.Router();
var passport = require('passport');

const Organization = require('../models').Organization;
const Address = require('../models').Address;
const User = require('../models').User;
const Facility = require('../models').Facility;

// To create a new Organization.

router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Organization.create(req.body).then((createdData) => {
        res.json({ success: true, data: createdData });
    }).catch(next);
});

// To update Organization.

router.put('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Organization.update(req.body, {
        where: { organizationId: req.body.organizationId }
    }).then((updatedData) => {
        res.json({ success: true, data: updatedData });
    }).catch(next);
});

module.exports = router;