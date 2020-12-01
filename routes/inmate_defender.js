const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Organization = require('../models').Organization;


router.get('/', function (req, res, next) {
    User.findOne({
        include:[
            {
                model:Organization,
                attributes: ["organizationId"],
                include:[
                    {
                        model: User,  attributes: ["userId", "firstName", "middleName", "lastName"],
                    }
                ]
            }
        ],
        attributes: ["userId"],
        where:{userId:req.user.userId}}).then(user => {
        res.json({ success: true, data: user });
    }).catch(next)
})

router.post('/', function (req, res, next) {
    console.log(req.body)
   User.findOne({
       where:{userId:req.body.inmateId}}).then((inmateFound)=>{
       User.findOne({where:{userId:req.body.publicdefenderId}}).then((defenderFound)=>{
        Promise.resolve(defenderFound.addPublicdefender(inmateFound)).then((user) => {
            res.json({ success: true, data: user });
        })
       })
   })
})


module.exports = router;