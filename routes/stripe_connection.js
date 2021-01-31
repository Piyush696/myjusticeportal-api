const express = require('express');
const router = express.Router();
var passport = require('passport');
const StripeConnection = require('../models').StripeConnection;
const util = require('../utils/validateUser');
const User = require('../models').User;
const userMeta = require('../models').UserMeta;
var Stripe = require('stripe');

/* get stripe Credencials. */
router.get('/', function(req, res, next) {
    util.validate([7], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            StripeConnection.findOne({ where: { stripeId: 1 } }).then(stripe => {
                res.json({ success: true, data: stripe });
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


/*update stripe Credencials */
router.post('/', function(req, res, next) {
    util.validate([7], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            StripeConnection.findOne({ where: { stripeId: 1 } }).then(stripe => {
                if (stripe) {
                    StripeConnection.update(req.body, {
                        where: { stripeId: 1 }
                    }).then((user) => {
                        res.json({ success: true, data: user });
                    }).catch(next);
                } else {
                    StripeConnection.create(req.body).then((user) => {
                        res.json({ success: true, data: user });
                    }).catch(next);
                }
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

router.get('/list-transactions', function(req, res, next) {
    User.findOne({
            include: [{
                model: userMeta,
                where: { metaKey: 'cust_id' }
            }],
            where: { userId: req.user.userId },
            attributes: ["userId", "userName", "firstName", "middleName", "lastName"],
        })
        .then((user) => {
            console.log('==============eeee', user.userMeta[0].metaValue)
            StripeConnection.findOne({
                    attributes: ['authKey'],
                    where: { stripeId: 1 }
                }).then((key) => {
                    let stripe = Stripe(key.dataValues.authKey);
                    stripe.charges.list({
                            "limit": 10,
                            "customer": user.userMeta[0].metaValue
                        })
                        .then((transactions) => {
                            res.json({ success: true, data: transactions.data });
                        })
                        .catch(next);
                })
                .catch(next);
        }).catch((next) => {
            console.log(next)
        });
});


module.exports = router;