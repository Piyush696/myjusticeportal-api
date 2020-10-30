const express = require('express');
const router = express.Router();

const User = require('../models').User;
const Organization = require('../models').Organization;
const Address = require('../models').Address;
const Case = require('../models').Case;
const UserAdditionalInfo = require('../models').UserAdditionalInfo;
const Files = require('../models').Files;
const Facility = require('../models').Facility;
const utils = require('../utils/file');
const util = require('../utils/validateUser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// To get all requested cases.

router.get('/', function (req, res, next) {
    util.validate([3], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({
                include: [
                    {
                        model: UserAdditionalInfo,
                        include: [
                            {
                                model: Files, as: 'profile'
                            }
                        ]
                    }
                ],
                where: { userId: req.user.userId }
            }).then((users) => {
                res.json({ success: true, data: users });
            });
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})


router.post('/uploadProfile', upload.any(), function (req, res, next) {
    util.validate([3], req.user.roles, function (isAuthenticated) {
        console.log(req.files)
        if (isAuthenticated) {
            req.files.forEach((file) => {
                utils.uploadFile(file, file.mimetype, req.user.userId, 'mjp-public', 'public-read', function (fileId) {
                    console.log(fileId)
                    if (fileId) {
                        UserAdditionalInfo.update({ ProfileImgId: fileId, userId: req.user.userId }, { where: { userId: req.user.userId } }).then(() => {
                            res.json({ success: true });
                        })
                    }
                });
            });
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
});

router.put('/', function (req, res, next) {
    util.validate([3], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            UserAdditionalInfo.findOne({ where: { userId: req.body.userId } }).then((user) => {
                if (user) {
                    UserAdditionalInfo.update(req.body.additionalInfo, { where: { userId: req.user.userId } }).then((data) => {
                        res.json({ success: true, data: data });
                    }).catch(next)
                } else {
                    req.body.additionalInfo['userId'] = req.user.userId
                    UserAdditionalInfo.create(req.body.additionalInfo).then((data) => {
                        res.json({ success: true, data: data });
                    }).catch(next)
                }
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

module.exports = router; 