const express = require('express');
const multer = require('multer');
const file = require('../utils/file');
const upload = multer({ dest: 'uploads/' })
const router = express.Router();
const Files = require('../models').Files;
const Case = require('../models').Case;
const utils = require('../utils/file');
const validateUtil = require('../utils/validateUser');

// To upload file.

router.post('/uploadFile', upload.any(), function (req, response, next) {
    validateUtil.validate([1], req.user.role, function (isAuthenticated) {
        if (isAuthenticated) {
            let itemsProcessed = 0;
            let fileIds = [];
            req.files.forEach((file, index, array) => {
                utils.uploadFile(file, file.mimetype, req.user.userId, 'mjp-private', 'private', function (fileId) {
                    if (fileId) {
                        fileIds.push(fileId);
                        if (itemsProcessed === array.length - 1) {
                            Case.findOne({ where: { userId: req.user.userId, caseId: req.body.caseId } }).then((caseData) => {
                                Files.findAll({ where: { fileId: fileIds } }).then((files) => {
                                    Promise.resolve(caseData.addCaseFile(files)).then(() => {
                                        response.json({ success: true });
                                    })
                                }).catch(next)
                            }).catch(next)
                        }
                        itemsProcessed++;
                    }
                });
            });
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
});

// To delete a file by id.

router.delete('/deleteFile/:fileId', function (req, res, next) {
    validateUtil.validate([1], req.user.role, function (isAuthenticated) {
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

// To get file DownloadLink.

router.post('/fileDownloadLink', function (req, res, next) {
    validateUtil.validate([1], req.user.role, function (isAuthenticated) {
        if (isAuthenticated) {
            Case.findOne({
                where: { userId: req.user.userId, caseId: req.body.caseId },
                attributes: ['caseId'],
                include: [
                    {
                        model: Files, as: 'caseFile',
                        where: { fileId: req.body.fileId }
                    }
                ]
            }).then((data) => {
                utils.getSingleSignedURL(data.caseFile[0], function (downloadLink) {
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

module.exports = router;