const express = require('express');
const router = express.Router();
var passport = require('passport');
const LibraryLink = require('../models').LibraryLink;

// To get the library links

router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    LibraryLink.findOne({ where: { libraryLinkId: 1 } }).then(link => {
        res.json({ success: true, data: link });
    })
})

/*update library links */

router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    LibraryLink.findOne({ where: { libraryLinkId: 1 } }).then(link => {
        if (link) {
            LibraryLink.update(req.body, {
                where: { libraryLinkId: 1 }
            }).then((result) => {
                res.json({ success: true, data: result });
            }).catch(next);
        }
        else {
            LibraryLink.create(req.body).then((result) => {
                res.json({ success: true, data: result });
            }).catch(next);
        }
    })
})

module.exports = router;