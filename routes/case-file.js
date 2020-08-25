const express = require('express');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const router = express.Router();
const Files = require('../models').Files;
const Case = require('../models').Case;
const utils = require('../utils/file');


router.post('/', upload.any(), function (req, response, next) {

    let itemsProcessed = 0;
    let addedFilesIds = [];


    req.files.forEach((file, index, array) => {
        utils.uploadFile(file, 'mjp-private', 'private', function (fileId) {
            if (fileId) {
                addedFilesIds.push(fileId);
                if (itemsProcessed === array.length - 1) {
                    let fileIds
                    if (req.body.fileIds) {
                        fileIds = addedFilesIds.concat(req.body.fileIds)
                    } else {
                        fileIds = addedFilesIds;
                    }
                    Case.findOne({ where: { userId: req.user.userId, caseId: req.body.caseId } }).then((caseData) => {
                        Files.findAll({ where: { fileId: fileIds } }).then((files) => {
                            Promise.resolve(caseData.addCaseFiles(files)).then(() => {
                                response.json({ success: true })
                            })
                        }).catch(next)
                    }).catch(next)
                }
                itemsProcessed++;
            }
        });
    });
});


router.post('/deletefile', function (req, res, next) {
    utils.deleteFile(req.body.fileId, function (deleteFile) {
        if (deleteFile) {
            res.json({ success: true })
        }
    })
})


module.exports = router;