const express = require('express');
const router = express.Router();
const Facility = require('../models').Facility;

// create Facility

router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    req.body['userId'] = req.user.userId;
    Facility.create(req.body).then(data => {
        res.json({ success: true, data: data });
    })
})

// get all Facility

router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Facility.findAll({
        include: [
            {
                model: User, attributes: ['userId', 'firstName', 'lastName', 'userName']
            }
        ],
        where: { userId: req.user.userId }
    }).then(data => {
        res.json({ success: true, data: data });
    })
})

// udate facility

router.put('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Facility.update(req.body, { where: { facilityId: req.body.facilityId } }).then(data => {
        res.json({ success: true, data: data });
    })
})

module.exports = router;