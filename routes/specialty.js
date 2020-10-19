const express = require('express');
const router = express.Router();
const Specialty = require('../models').Specialty;

router.post('/', function (req, res, next) {
    Specialty.create(req.body).then(data => {
        res.json({ success: true, data: data });
    }).catch(next)
})


router.get('/', function (req, res, next) {
    Specialty.findAll().then(data => {
        res.json({ success: true, data: data });
    }).catch(next)
})

module.exports = router; 