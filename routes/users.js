const express = require('express');
const router = express.Router();
const utils = require('../config/utils');
var passport = require('passport');
const User = require('../models').User;
const Role = require('../models').Role;
/* Get user by ID or users list. */

router.get('/:id?', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    const query = {};
    if (req.query && req.query.email) {
        query.where = query.where || {};

        query.where.email = req.query.email;
    }

    User.findAndCountAll(query).then((users) => {

        res.json({ success: true, data: users.rows, count: users.count });
    }).catch(next)
});

/* Add new user. */

router.post('/', function (req, res, next) {
    console.log(req.body)
    if (!req.body.email)
        return next(new Error('missing_email'));
    if (!req.body.password)
        return next(new Error('missing_password'));

    let newData = {
        // createdBy: req.locals.user.id,
        password: User.generateHash(req.body.password),
        confirmPassword: User.generateHash(req.body.confirmPassword)
    };

    utils.validateQuery(req.body, newData, 'email');
    utils.validateQuery(req.body, newData, 'firstName');
    utils.validateQuery(req.body, newData, 'lastName');
    if (newData.errors)
        return next(newData.errors[0]);
    // if (!req.body.roleId)
    //     newData.roleId = 1;
    console.log(role)
    User.create(newData).then((user) => {
        console.log(user)
        // Role.findAll({ where: { roleId: 1 } }).then((roles) => {
        //     console.log(roles)
        //     Promise.resolve(user.setRoles(roles)).then(() => {
        //         res.json({ success: true, data: user })
        //     })
        // }).catch(next);
    })
});

router.post('/registration', function (req, res, next) {
    User.create({
        email: req.body.email,
        password: User.generateHash(req.body.password),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username
    }).then((user) => {
        Role.findAll({ where: { roleId: 1 } }).then((roles) => {
            Promise.resolve(user.setRoles(roles)).then(() => {
                res.json({ success: true, data: user })
            })
        }).catch(next);
    }).catch(next);
});

/* Update user by ID. */

router.patch('/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let newData = {};
    let query = {};

    utils.validateQuery(req.body, newData, 'email');
    utils.validateQuery(req.body, newData, 'status');
    utils.validateQuery(req.body, newData, 'fullName');
    utils.validateQuery(req.body, newData, 'birthday');
    utils.validateQuery(req.body, newData, 'education');
    utils.validateQuery(req.body, newData, 'risk');


    if (req.body.password && req.body.password.length)
        newData.password = User.generateHash(req.body.password);

    if (newData.errors)
        return next(newData.errors[0]);

    query.where = { id: req.params.id };

    User.update(newData, query).then(() => {

        res.json({ success: true });
    }).catch(next)
});

/* Delete user by ID. */

router.delete('/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {

    User.destroy({
        where: { id: req.params.id },
    }).then(() => {

        res.json({ success: true });
    }).catch(next)
});

router.post('/user', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User.findOne({ where: { id: req.body.UserId } }).then((user) => {
        res.json({ success: true, data: user });
    })
})



router.get('/allUser/user', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    User.findAll().then(user => {
        res.json({ success: true, data: user });
    })
})


// update Password
router.put('/:userId', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let newData = {};
    let query = {};
    console.log("Piyush", req.body)
    if (req.body.password && req.body.password.length)
        newData.password = User.generateHash(req.body.password);
    if (newData.errors)
        return next(newData.errors[0]);

    query.where = { id: req.params.userId };

    User.update(newData, query).then(() => {

        res.json({ success: true });
    }).catch(next)
});

router.put('/user/id', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    User.update({ firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, company: req.body.company }, { where: { id: req.body.UserId } }).then((user) => {
        res.json({ success: true, data: user });
    })
});


module.exports = router;