const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Case = require('../models').Case;
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


router.get('/allInmateAssignedCases', function (req, res, next) {
    User.findOne({ 
        attributes: ["userId"],
        where:{userId:req.user.userId},
        include:[{
            model: User, as: "publicdefender" ,
        }]
    }).then(user => {
        let userIds = user.publicdefender.map(data => data.userId);
        Case.findAll({
                include: [
                    {
                        model: User, as: 'inmate',
                        attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName'],
                        where: { userId: userIds },
                    }
                ],
                attributes:['briefDescriptionOfChargeOrLegalMatter', 'legalMatter', 'otherInformation', 'updatedAt']
        }).then(cases=>{
            res.json({ success: true, data: cases });
        }).catch(next)
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