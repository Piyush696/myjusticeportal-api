const express = require("express");
const router = express.Router();
const User = require("../models").User;
const Role = require("../models").Role;
const Facility = require("../models").Facility;
const Defender_Facility = require("../models").defender_facility;
const inmate_defender = require("../models").inmate_defender;
const util = require("../utils/validateUser");

router.get("/", function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Defender_Facility.findAll({ where: { defenderId: req.user.userId } }).then((defdenderFacility) => {
                inmate_defender.findAll({ where: { publicdefenderId: req.user.userId } }).then((foundInmates) => {
                    let facilityIds = defdenderFacility.map((x) => x.facilityId)
                    if (foundInmates.length > 0) {
                        User.findAll({
                            include: [{
                                    model: Facility,
                                    where: { facilityId: facilityIds }
                                },
                                {
                                    model: Role,
                                    through: { attributes: [] },
                                    attributes: ["roleId"],
                                    where: { roleId: 1 }
                                }
                            ],
                            attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt']
                        }).then((user) => {
                            let count = 0;
                            foundInmates.forEach((element, index, Array) => {
                                user.map((ele) => {
                                    if (element.dataValues.inmateId === ele.dataValues.userId) {
                                        ele.dataValues['assigned'] = true
                                        if (count === Array.length - 1) {
                                            res.json({ success: true, data: user });
                                        }
                                        count++
                                    }
                                })
                            })
                        }).catch(next);
                    } else {
                        User.findAll({
                            include: [{
                                    model: Facility,
                                    where: { facilityId: facilityIds }
                                },
                                {
                                    model: Role,
                                    through: { attributes: [] },
                                    attributes: ["roleId"],
                                    where: { roleId: 1 }
                                }
                            ],
                            attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt']
                        }).then((user) => {
                            res.json({ success: true, data: user });
                        }).catch(next);
                    }
                }).catch(next);
            }).catch(next);
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    });
});

router.get('/defender-facility', function(req, res, next) {
    util.validate([5], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Defender_Facility.findAll({
                where: { defenderId: req.user.userId }
            }).then(data => {
                let facilityIds = data.map((x) => x.facilityId)
                Facility.findAll({ where: { facilityId: facilityIds } }).then((facilities) => {
                    let count = 0;
                    data.forEach((element, index, Array) => {
                        facilities.map((y) => {
                            if (element.dataValues.facilityId === y.dataValues.facilityId) {
                                y.dataValues['isSponsors'] = element.dataValues.isSponsors
                                y.dataValues['isPremium'] = element.dataValues.isPremium
                                y.dataValues['isSelected'] = element.dataValues.isSelected
                                if (count === Array.length - 1) {
                                    res.json({ success: true, facilities: facilities });
                                }
                                count++
                            }
                        })
                    })
                })
            }).catch(next)
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


module.exports = router;