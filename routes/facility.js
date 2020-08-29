const express = require('express');
const router = express.Router();
var passport = require('passport');
const User = require('../models').User;
const Facility = require('../models').Facility;

// create Facility

router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Facility.create(req.body).then(facility => {
        User.findOne({ where: { userId: req.user.userId } }).then((user) => {
            Promise.resolve(user.addFacility(facility)).then((userFacility) => {
                res.json({ success: true, data: userFacility });
            }).catch(next)
        }).catch(next)
    }).catch(next)
})
// get all Facility

router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Facility, through: { attributes: [] }
            }
        ],
        where: { userId: req.user.userId }
    }).then(data => {
        res.json({ success: true, data: data });
    })
})

// udate facility

router.put('/:facilityId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Facility.update(req.body, { where: { facilityId: req.params.facilityId } }).then(data => {
        res.json({ success: true, data: data });
    })
})

router.delete('/:facilityId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Facility.destroy({ where: { facilityId: req.params.facilityId } }).then(data => {
        res.json({ success: true, data: data });
    })
})

module.exports = router;