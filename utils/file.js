const Files = require('../models').Files;
const AWS = require('aws-sdk');
const fs = require('fs');

//aws credentials
AWS.config.update({
    accessKeyId: "AKIA42UVEFEFVCJMGROZ",
    secretAccessKey: "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",
    signatureVersion: 'v4',
    region: 'us-east-2'
});

module.exports = {
    uploadFile: function (file, fileType, createdByUserId, Bucket, ACL, callback) {
        let timeStamp = new Date().getTime();
        let splitFile = file.originalname.split(".");
        let uniqueFile = splitFile[0] + "_" + timeStamp + "." + splitFile[1];

        const params = {
            Bucket: Bucket,
            Key: uniqueFile, //filename on aws
            ACL: ACL,
            Body: fs.createReadStream(file.path)      //image content
        };
        let s3 = new AWS.S3();
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            //   console.log(`File uploaded successfully. ${data.Location}`);
            Files.create({
                fileName: uniqueFile, downloadLink: data.Location,
                bucket: Bucket, ACL: ACL, fileType: fileType,
                createdByUserId: createdByUserId
            }).then((createdFile) => {
                callback(createdFile.fileId);
            })
        });
    },

    deleteFile: function (fileId, callback) {
        Files.findOne({ where: { fileId: fileId } }).then((fileData) => {
            if (fileData.bucket) {
                let s3 = new AWS.S3();
                var deleteParams = {
                    Bucket: fileData.bucket,
                    Key: fileData.fileName
                };
                s3.deleteObject(deleteParams, function (err, data) {
                    if (err);  // console.log(err, err.stack); // an error occurred
                    else  // console.log(data);           // successful response
                        Files.destroy({ where: { fileId: fileData.fileId } }).then((deletedFile) => {
                            callback(deletedFile)
                        })
                });
            } else {
                Files.destroy({ where: { fileId: fileData.fileId } }).then((deletedFile) => {
                    callback(deletedFile)
                })
            }
        })
    },

    getSignedURLs: function (files, callback) {
        let itemsProcessed = 0;
        let s3 = new AWS.S3();
        files.forEach((file, index, array) => {
            if (file.bucket) {
                var signedParams = { Bucket: file.bucket, Key: file.fileName, Expires: 100 };
                s3.getSignedUrl('getObject', signedParams, function (err, url) {
                    if (err) { }
                    if (url) // console.log('The URL is', url); // expires in 60 seconds
                        file.downloadLink = url;
                    if (itemsProcessed === array.length - 1) {
                        callback(files);
                    }
                    itemsProcessed++;
                });
            } else {
                if (itemsProcessed === array.length - 1) {
                    callback(files);
                }
                itemsProcessed++;
            }
        });
    },

    getSingleSignedURL: function (file, callback) {
        let s3 = new AWS.S3();
        if (file.bucket) {
            var signedParams = { Bucket: file.bucket, Key: file.fileName, Expires: 60 };
            s3.getSignedUrl('getObject', signedParams, function (err, url) {
                if (err) { }
                if (url) // console.log('The URL is', url); // expires in 60 seconds
                    callback(url)
            });
        } else {
            callback(file.downloadLink)
        }
    },
}