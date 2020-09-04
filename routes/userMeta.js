const express = require('express');
const router = express.Router();
var passport = require('passport');
const UserMeta = require('../models').UserMeta;
const User = require('../models').User;

router.post('/', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    let userId;
    if (req.body.userId) {
        userId = req.body.userId
    } else {
        userId = req.user.userId
    }
    UserMeta.findOne({ where: { metaKey: req.body.metaKey, userId: userId } }).then((data) => {
        if (data == null) {
            UserMeta.create({ metaKey: req.body.metaKey, metaValue: req.body.metaValue, createdBy: req.user.id, userId: userId }).then((result) => {
                res.json({ success: true, data: result })
            }).catch(next);
        }
        else {
            UserMeta.update({ metaKey: req.body.metaKey, metaValue: req.body.metaValue, updatedBy: req.user.id }, { where: { metaKey: req.body.metaKey, userId: userId } }).then((result) => {
                res.json({ success: true, data: result })
            }).catch(next);
        }
    }).catch(next);
});

router.post('/createUserMetaList', async function (req, res, next) {
    User.findOne({ attributes: ['userId'], where: { userName: req.body.userName } }).then((user) => {
        var userMetaList = req.body.metaList;
        var userMetaCount = 0;
        userMetaList.forEach((userMeta, userMetaIndex, userMetaArray) => {
            UserMeta.create({
                metaKey: userMeta.metaKey, metaValue: userMeta.metaValue, userId: user.userId,
                createdBy: user.userId
            }).then((result) => {
                if (userMetaCount === userMetaArray.length - 1) {
                    res.json({ success: true, data: result })
                }
                userMetaCount++
            }).catch(next);
        })
    }).catch(next);
});

router.get('/', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    UserMeta.findAll({ where: { userId: req.user.userId } }).then((data) => {
        res.json({ success: true, data: data })
    }).catch(next);
});

router.put('/', function (req, res, next) {
    UserMeta.update({ metaValue: req.body.metaValue }, { where: { userId: req.body.userId, userMetaId: req.body.userMetaId } }).then((data) => {
        res.json({ success: true, data: data });
    }).catch(next);
})

// get userMeta value.

router.post('/getValue', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    UserMeta.findOne({ where: { metaKey: req.body.metaKey, userId: req.user.userId } }).then((result) => {
        res.json({ success: true, data: result });
    }).catch(next);
});

// userMeta update from myacc
router.put('/update', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    for (data of req.body) {
        UserMeta.update({ metaValue: data.metaValue }, { where: { userId: req.user.userId, userMetaId: data.userMetaId } }).then((data) => {
            res.json({ success: true, data: data });
        }).catch(next);
    }
})


module.exports = router;