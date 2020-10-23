const express = require('express');
const router = express.Router();
var passport = require('passport');
const StripeConnection = require('../models').StripeConnection;
const util = require('../utils/validateUser');

/* get stripe Credencials. */
router.get('/', function (req, res, next) {
    util.validate([7], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            StripeConnection.findOne({ where: { stripeId: 1 } }).then(stripe => {
                res.json({ success: true, data: stripe });
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


/*update stripe Credencials */
router.post('/', function (req, res, next) {
    util.validate([7], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            StripeConnection.findOne({ where: { stripeId: 1 } }).then(stripe => {
                if (stripe) {
                    StripeConnection.update(req.body, {
                        where: { stripeId: 1 }
                    }).then((user) => {
                        res.json({ success: true, data: user });
                    }).catch(next);
                }
                else {
                    StripeConnection.create(req.body).then((user) => {
                        res.json({ success: true, data: user });
                    }).catch(next);
                }
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

module.exports = router;