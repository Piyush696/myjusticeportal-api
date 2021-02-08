const express = require('express');
const router = express.Router();
const User = require('../models').User;
const bondsman_user = require('../models').bondsman_user;
const util = require('../utils/validateUser');

//set user bondsman
router.post('/', function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            req.body['status'] = 'Requested',
                req.body['userId'] = req.user.userId
            bondsman_user.create(req.body).then((bondrsmanUse) => {
                res.json({ success: true, data: bondrsmanUse });
            }).catch(next)

        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

// To get all requested user.
router.post('/requested-users', function(req, res, next) {
    util.validate([6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            bondsman_user.findAll({
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt']
                }],
                where: { status: req.body.status, bondsmanId: req.user.userId }
            }).then((foundConnections) => {
                res.json({ success: true, data: foundConnections });
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})

//to get single user data
router.get('/requested-users/:bondsman_userId', function(req, res, next) {
    util.validate([6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            bondsman_user.findOne({
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt']
                }],
                where: { bondsman_userId: req.params.bondsman_userId }
            }).then((foundConnections) => {
                res.json({ success: true, data: foundConnections });
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})


// To set data after user Approved.

router.post('/approve-user', function(req, res, next) {
    util.validate([6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            bondsman_user.update({ status: 'Approved' }, {
                where: { bondsman_userId: req.body.bondsman_userId, bondsmanId: req.user.userId }
            }).then(() => {
                res.json({ success: true });
            });
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
});

// To set data after user Rejected.

router.post('/reject-user', function(req, res, next) {
    util.validate([6], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            bondsman_user.update({ status: 'Rejected' }, {
                where: { bondsman_userId: req.body.bondsman_userId, bondsmanId: req.user.userId }
            }).then(() => {
                res.json({ success: true });
            });
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
});


module.exports = router;