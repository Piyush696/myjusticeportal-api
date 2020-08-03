const express = require('express');
const router = express.Router();
const utils = require('../config/utils');
var passport = require('passport');
const User = require('../models').User;
const Role = require('../models').Role;
const jwt = require('jsonwebtoken');
const config = require('../config/config');
/* Get user by ID or users list. */

router.post('/registration', function (req, res, next) {
    User.create({
        email: req.body.email,
        password: User.generateHash(req.body.password),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username
    }).then((user) => {
        Role.findAll({ where: { roleId: req.body.roleId } }).then((roles) => {
            Promise.resolve(user.setRoles(roles)).then(() => {
                let expiresIn = req.body.rememberMe ? '15d' : '1d';
                let token = jwt.sign({
                    userId: user.userId,
                    email: user.email.toLowerCase(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: roles
                }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
                res.json({ success: true, token: token })
            })
        }).catch(next);
    }).catch(next);
});


router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User.findAll({
        include: [
            {
                model: Role, through: {
                    attributes: []
                },
            }
        ],
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch(next)
})

module.exports = router;