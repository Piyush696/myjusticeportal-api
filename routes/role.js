const express = require('express');
const router = express.Router();
var passport = require('passport');
const Role = require('../models').Role;
/* Get user by ID or users list. */

router.get('/', function (req, res, next) {
    Role.findAll().then(role => {
        res.json({ success: true, data: role });
    })
})


// update Password


module.exports = router;