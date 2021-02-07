const express = require("express");
const router = express.Router();
var passport = require("passport");
const UserMeta = require("../models").UserMeta;
const User = require("../models").User;
const Facility = require("../models").Facility;

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    async function(req, res, next) {
        let userId;
        if (req.body.userId) {
            userId = req.body.userId;
        } else {
            userId = req.user.userId;
        }
        UserMeta.findOne({ where: { metaKey: req.body.metaKey, userId: userId } })
            .then((data) => {
                if (data == null) {
                    UserMeta.create({
                            metaKey: req.body.metaKey,
                            metaValue: req.body.metaValue,
                            createdBy: req.user.id,
                            userId: userId,
                        })
                        .then((result) => {
                            res.json({ success: true, data: result });
                        })
                        .catch(next);
                } else {
                    UserMeta.update({
                            metaKey: req.body.metaKey,
                            metaValue: req.body.metaValue,
                            updatedBy: req.user.id,
                        }, { where: { metaKey: req.body.metaKey, userId: userId } })
                        .then((result) => {
                            res.json({ success: true, data: result });
                        })
                        .catch(next);
                }
            })
            .catch(next);
    }
);

router.post("/createUserMetaList", async function(req, res, next) {
    User.findOne({
            attributes: ["userId"],
            where: { userName: req.body.userName },
        })
        .then((user) => {
            var userMetaList = req.body.metaList;
            var userMetaCount = 0;
            userMetaList.forEach((userMeta, userMetaIndex, userMetaArray) => {
                UserMeta.create({
                        metaKey: userMeta.metaKey,
                        metaValue: userMeta.metaValue,
                        userId: user.userId,
                        createdBy: user.userId,
                    })
                    .then((result) => {
                        if (userMetaCount === userMetaArray.length - 1) {
                            res.json({ success: true, data: result });
                        }
                        userMetaCount++;
                    })
                    .catch(next);
            });
        })
        .catch(next);
});

router.post("/createUserMeta", passport.authenticate("jwt", { session: false }), async function(req, res, next) {
    UserMeta.create({
        metaKey: req.body.metaKey,
        metaValue: req.body.metaValue,
        userId: req.user.userId,
        createdBy: req.user.userId,
    }).then((result) => {
        res.json({ success: true, data: result });
    }).catch(next);
});

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    async function(req, res, next) {
        UserMeta.findAll({ where: { userId: req.user.userId } })
            .then((data) => {
                res.json({ success: true, data: data });
            })
            .catch(next);
    }
);

router.post("/getModalValue", passport.authenticate("jwt", { session: false }), async function(req, res, next) {
    UserMeta.findOne({
            where: { metaKey: req.body.metaKey, userId: req.user.userId },
        })
        .then((result) => {
            res.json({ success: true, data: result });
        })
        .catch(next);
});

router.put("/", function(req, res, next) {
    UserMeta.update({ metaValue: req.body.metaValue }, { where: { userId: req.body.userId, userMetaId: req.body.userMetaId } })
        .then((data) => {
            res.json({ success: true, data: data });
        })
        .catch(next);
});


router.post(
    "/getValue",
    passport.authenticate("jwt", { session: false }),
    async function(req, res, next) {
        UserMeta.findOne({
                where: { metaKey: req.body.metaKey, userId: req.user.userId },
            })
            .then((result) => {
                res.json({ success: true, data: result });
            })
            .catch(next);
    }
);

// userMeta update from myacc

router.put(
    "/update",
    passport.authenticate("jwt", { session: false }),
    function(req, res, next) {
        for (let data of req.body) {
            UserMeta.update({ metaValue: data.metaValue }, { where: { userId: req.user.userId, userMetaId: data.userMetaId } })
                .then((data) => {
                    res.json({ success: true, data: data });
                })
                .catch(next);
        }
    }
);

router.get("/user/userMeta", passport.authenticate("jwt", { session: false }), async function(req, res, next) {
    User.findOne({
        include: [{
            model: UserMeta,
        }],
        where: { userId: req.user.userId },
    }).then((user) => {
        res.json({ success: true, data: user });
    });
});

router.post("/modal/caseCreate", passport.authenticate("jwt", { session: false }), async function(req, res, next) {
    req.body.userMeta['userId'] = req.user.userId
    req.body.userMeta['createdBy'] = req.user.userId
    UserMeta.create(req.body.userMeta)
        .then((result) => {
            res.json({ success: true, data: result });
        })
        .catch(next);
});
module.exports = router;