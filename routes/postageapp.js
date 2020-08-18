const express = require('express');
const router = express.Router();
var passport = require('passport');
const Postage = require('../models').Postage;

/* get postage Credencials. */
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Postage.findOne({ where: { postageAppId: 1 } }).then(postage => {
        res.json({ success: true, data: postage });
    })
})


/*update postage Credencials */
router.put('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    Postage.findOne({ where: { postageAppId: 1 } }).then(postage => {
        if (postage) {
            Postage.update(req.body, {
                where: { postageAppId: 1 }
            }).then((user) => {
                res.json({ success: true, data: user });
            }).catch(next);
        }
        else {
            Postage.create(req.body).then((user) => {
                res.json({ success: true, data: user });
            }).catch(next);
        }
    })
})

module.exports = router;