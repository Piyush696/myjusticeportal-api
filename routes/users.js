const express = require('express');
const router = express.Router();
var passport = require('passport');
const User = require('../models').User;
const Role = require('../models').Role;
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/* user registration. */
router.post('/registration', function (req, res, next) {
    let isMfa;
    if (req.body.roleId == 1) {
        isMfa = false;
    } else {
        isMfa = true;
    }
    User.create({
        email: req.body.email,
        password: User.generateHash(req.body.password),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        middleName: req.body.middleName,
        isMFA: isMfa
    }).then((user) => {
        Role.findAll({ where: { roleId: req.body.roleId } }).then((roles) => {
            Promise.resolve(user.setRoles(roles)).then((userRole) => {
                res.json({ success: true, data: user })
            })
        }).catch(next);
    }).catch(next);
});

/*findAll user include role */
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

// single user.

router.get('/user', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Role, through: {
                    attributes: []
                }
            }
        ], where: { userId: req.user.userId }
    }).then((user) => {
        res.json({ success: true, data: user });
    }).catch(next);
})

/*update Password */
router.put('/password', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let newData = {};
    let query = {};
    if (req.body.password && req.body.password.length)
        newData.password = User.generateHash(req.body.password);
    if (newData.errors)
        return next(newData.errors[0]);
    query.where = { userId: req.user.userId };
    User.update(newData, query).then(() => {
        res.json({ success: true });
    }).catch(next)
});

/*update user */
router.put('/', function (req, res, next) {
    User.update({ status: req.body.value.status }, {
        where: { userName: req.body.value.userName }
    }).then((user) => {
        User.findOne({
            include: [
                {
                    model: Role, through: {
                        attributes: []
                    },
                }
            ],
            where: { userName: req.body.value.userName }
        }).then((user) => {
            let expiresIn = req.body.rememberMe ? '15d' : '1d';
            let token = jwt.sign({
                userId: user.userId,
                userName: user.userName,
                firstName: user.firstName,
                middleName: req.body.middleName,
                lastName: user.lastName,
                role: user.roles
            }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
            res.json({ success: true, token: token });
        })
    }).catch(next);
})

// myacc User Update

router.put('/updateUser', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    User.update(req.body, {
        where: { userId: req.user.userId }
    }).then(result => {
        res.json({ success: true, data: result });
    }).catch(next);
})

/*update Password */

router.put('/reset-pass', function (req, res, next) {
    let newData = {};
    let query = {};
    User.findOne({
        where: { userName: req.body.userName }
    }).then((user) => {
        if (user.securityQuestionAnswered === 3) {
            if (req.body.password && req.body.password.length) {
                newData.password = User.generateHash(req.body.password);
                newData.securityQuestionAnswered = 0;
            }
            if (newData.errors)
                return next(newData.errors[0]);
            query.where = { userName: req.body.userName }
            User.update(newData, query).then(() => {
                res.json({ success: true, newData });
            }).catch(next)
        }
    })
});

// delete user.

router.delete('/:userId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    if (req.user.role[0].roleId === 7 && req.user.userId !== req.params.userId) {
        User.destroy({
            where: { userId: req.params.userId }
        }).then(() => {
            res.json({ success: true });
        }).catch(next);
    } else {
        res.json({ success: false });
    }
});

// single user.

router.get('/singleUser/:userId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    if (req.user.role[0].roleId === 7) {
        User.findOne({
            include: [
                {
                    model: Role, through: {
                        attributes: []
                    }
                }
            ], where: { userId: req.params.userId }
        }).then((userData) => {
            res.json({ success: true, data: userData });
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

// Update User by userId.

router.put('/updateSingleUser', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.role[0].roleId === 7) {
        User.update(req.body, {
            where: { userId: req.body.userId }
        }).then(result => {
            res.json({ success: true, data: result });
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

// Change Role.

router.put('/changeRole', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.role[0].roleId === 7) {
        User.findOne({
            include: [
                {
                    model: Role, through: {
                        attributes: []
                    }
                }
            ], where: { userId: req.body.userId }
        }).then((userData) => {
            Promise.resolve(userData.setRoles(req.body.roleId)).then((userRole) => {
                res.json({ success: true, data: userData });
            })
        }).catch(next);
    } else {
        res.json({ success: false });
    }
})

module.exports = router;