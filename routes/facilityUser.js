// const express = require('express');
// const router = express.Router();
// const Facility = require('../models').Facility;
// const User = require('../models').User;

// /* Get user by ID or users list. */

// router.get('/', function(req, res, next) {
//     User.findAll({
//         include:[
//             {
//                 model:
//             }
//         ],
//         where:{userId:req.user.userId}
//     }).then((user) => {
//         res.json({ success: true, data: user });
//     }).catch((next) => {
//         console.log(next)
//     })
// })


// // update Password


// module.exports = router;