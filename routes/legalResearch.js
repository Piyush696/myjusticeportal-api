const express = require('express');
const router = express.Router();
var passport = require('passport');
const LegalResearch = require('../models').LegalResearch;
const User = require('../models').User;
const File = require('../models').Files;
const util = require('../utils/validateUser');
const UserMeta = require('../models').UserMeta;
const utils = require('../utils/file');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// To get file DownloadLink.

router.post('/fileDownloadLink', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            LegalResearch.findOne({
                where: { userId: req.user.userId, researcherFileId: req.body.fileId },
                attributes: ['legalResearchId'],
                include: [
                    {
                        model: File, as: 'researcherFile',
                        attributes: ['fileId', 'bucket', 'fileName', 'createdAt', 'updatedAt', 'createdByUserId'],
                        where: { fileId: req.body.fileId }
                    }
                ]
            }).then((data) => {
                utils.getSingleSignedURL(data.researcherFile, function (downloadLink) {
                    if (downloadLink) {
                        res.json({ success: true, data: downloadLink });
                    }
                })
            }).catch(next);
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

/* post legal research. */
router.post('/', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            req.body['userId'] = req.user.userId;
            LegalResearch.create(req.body).then(data => {
                res.json({ success: true, data: data });
            }).catch(next => {
                utils.validator(next, function (err) {
                    res.status(400).json(err)
                })
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


/*get all legal research*/
router.get('/reseacherList', function (req, res, next) {
    util.validate([1,4], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            LegalResearch.findAll({
                include: [
                    {
                        model: User, as: 'inmate',
                        attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName']
                    },
                    {
                        model:File,as:'researcherFile', attributes: ['fileId']
                    },{
                        model:User,as:'researcher',  attributes: ['userId']
                    }
                ],
                // where: { userId: req.user.userId }
            }).then(data => {
                res.json({ success: true, data: data });
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

router.get('/:legalResearchId', function (req, res, next) {
    util.validate([1,4], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            LegalResearch.findOne({
                include: [
                    {
                        model: User, as: 'inmate',
                        attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName'],
                        include: [
                            {
                                model: UserMeta,
                            }
                        ]
                    },
                    {
                        model:File,as:'researcherFile'
                    },{
                        model:User,as:'researcher',  attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName']
                    }
                ],
                where: { legalResearchId: req.params.legalResearchId }
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

/*edit legal research form */

router.put('/:legalResearchId', function (req, res, next) {
    util.validate([4], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            LegalResearch.update(req.body, { where: { legalResearchId: req.params.legalResearchId } }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next => {
                utils.validator(next, function (err) {
                    res.status(400).json(err)
                })
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

//uploadLogo

router.post('/uploadFile', upload.any(), function (req, res, next) {
    util.validate([4], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            req.files.forEach((file) => {
                utils.uploadFile(file, file.mimetype, req.user.userId, 'mjp-public', 'public-read', function (fileId) {
                    if (fileId) {
                        let researcherId = parseInt(req.body.legalResearchId)
                        LegalResearch.update({ researcherFileId: fileId,researcherId: req.user.userId}, { where: { LegalResearchId: researcherId } }).then(() => {
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

router.delete('/deleteFile/:fileId', function (req, res, next) {
    util.validate([4], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            utils.deleteFile(req.params.fileId, function (deleteFile) {
                if (deleteFile) {
                    res.json({ success: true });
                }
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

module.exports = router;