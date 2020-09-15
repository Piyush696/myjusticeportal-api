const express = require('express');
const router = express.Router();
var passport = require('passport');
const Postage = require('../models').Postage;
const util = require('../utils/validateUser');

/* get postage Credencials. */
router.get('/', function (req, res, next) {
    util.validate([7], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Postage.findOne({ where: { postageAppId: 1 } }).then(postage => {
                res.json({ success: true, data: postage });
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


/*update postage Credencials */
router.post('/', function (req, res, next) {
    util.validate([7], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
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
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

module.exports = router;