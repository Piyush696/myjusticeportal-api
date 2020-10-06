const express = require('express');
const router = express.Router();
const User = require('../models').User;
const bondsman_user = require('../models').bondsman_user;
const util = require('../utils/validateUser');

//set user bondsman
router.post('/', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            req.body.map((element) => {
                element['status'] = 'Requested',
                    element['userId'] = req.user.userId
            })
            bondsman_user.create(req.body).then((bondrsmanUse) => {
                res.json({ success: true, data: bondrsmanUse });
            }).catch((next) => {
                console.log(next)
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// To get all requested user.
router.post('/requested-users', function (req, res, next) {
    util.validate([6], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            bondsman_user.findAll({
                where: { status: 'Requested', bondsman_userId: req.user.userId }
            }).then((foundConnections) => {
                let userIds = foundConnections.map(x => x.userId)
                User.findAll({ where: { userId: userIds } }).then((users) => {
                    res.json({ success: true, data: foundConnections });
                }).catch((next) => {
                    console.log(next)
                })
            });
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})

// To set data after user Approved.

router.post('/approve-user/:bondsman_userId', function (req, res, next) {
    util.validate([6], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            bondsman_user.update({ status: 'Approved' }, {
                where: { bondsman_userId: req.params.bondsman_userId, bondsmanId: req.user.userId }
            }).then(() => {
                res.json({ success: true });
            });
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
});

// To set data after user Rejected.

router.post('/reject-user/:bondsman_userId', function (req, res, next) {
    util.validate([6], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            bondsman_user.update({ status: 'Rejected' }, {
                where: { bondsman_userId: req.body.bondsman_userId, bondsmanId: req.user.userId }
            }).then(() => {
                res.json({ success: true });
            });
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
});


module.exports = router; 