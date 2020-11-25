const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const Files = require('../models').Files;
const Case = require('../models').Case;
const File_case = require('../models').file_case;
const utils = require('../utils/file');
const validateUtil = require('../utils/validateUser');

// To upload file.

router.post('/uploadFile', upload.any(), function (req, res, next) {
    console.log(req.user)
    validateUtil.validate([3], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            let itemsProcessed = 1;
            req.files.forEach((file, index, array) => {
                utils.uploadFile(file, file.mimetype, req.user.userId, 'mjp-private', 'private', function (fileId) {
                    if (fileId) {  
                        console.log(fileId)
                        req.body.fileId = fileId;
                        File_case.create(req.body).then(() => {
                            if (itemsProcessed === array.length) {
                                res.json({ success: true });
                            } else {
                                itemsProcessed++;
                            }
                        });
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
    validateUtil.validate([1,3], req.user.roles, function (isAuthenticated) {
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
    validateUtil.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Case.findOne({
                where: { userId: req.user.userId, caseId: req.body.caseId },
                attributes: ['caseId'],
                include: [
                    {
                        model: Files, as: 'caseFile',
                        attributes: ['fileId', 'bucket', 'fileName', 'createdAt', 'updatedAt', 'createdByUserId'],
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