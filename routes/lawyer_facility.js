const express = require("express");
const router = express.Router();
const Facility = require("../models").Facility;
const Lawyer_Facility = require("../models").lawyer_facility;
const util = require('../utils/validateUser');

// get lawyer facility.
router.get('/', function (req, res, next) {
    util.validate([3], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_Facility.findAll({
                where: { lawyerId: req.user.userId }
            }).then(data => {
                let facilityIds = data.map((x)=>x.facilityId)
                Facility.findAll({where:{facilityId:facilityIds}}).then((facilities) => {
                    let count = 0;
                    data.forEach((element, index, Array)=>{
                        facilities.map((y)=>{
                            if(element.dataValues.facilityId === y.dataValues.facilityId){
                                y.dataValues['isSponsors'] = element.dataValues.isSponsors
                                y.dataValues['isPremium'] = element.dataValues.isPremium
                                y.dataValues['isSelected'] = element.dataValues.isSelected,
                                y.dataValues['planSelected'] = element.dataValues.planSelected
                                if (count === Array.length - 1) {
                                    res.json({ success: true, facilities: facilities });
                                }
                                count++
                            }
                        })
                    })
                })
            }).catch(next)
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

module.exports = router; 