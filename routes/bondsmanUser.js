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
                include: [
                    {
                        model: User,
                    }
                ],
                where: { status: 'Requested', bondsman_userId: req.user.userId }
            }).then((foundConnections) => {
                res.json({ success: true, data: foundConnections });
            });
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})


module.exports = router; 