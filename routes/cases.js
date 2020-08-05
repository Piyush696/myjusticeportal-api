const express = require('express');
const router = express.Router();
var passport = require('passport');
const Case = require('../models').Case;

/* create case. */
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Case.create({
        countyOfArrest: req.body.countyOfArrest, dateOfArrest: req.body.dateOfArrest,
        caseRelatedTo: req.body.caseRelatedTo, caseJurisdiction: req.body.caseJurisdiction,
        nextCourtDate: req.body.nextCourtDate, legalRepresentative: req.body.legalRepresentation,
        userId: req.user.userId
    }).then(data => {
        res.json({ success: true, data: data });
    })
})


module.exports = router;