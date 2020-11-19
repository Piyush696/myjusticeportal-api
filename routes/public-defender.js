const express = require("express");
const router = express.Router();
const User = require("../models").User;
const Role = require("../models").Role;
const Facility = require("../models").Facility;
const util = require("../utils/validateUser");

router.get("/", function (req, res, next) {
  util.validate([5], req.user.roles, function (isAuthenticated) {
    if (isAuthenticated) {
        let facilityIds = req.user.facilities.map((x)=>x.facilityId)
        console.log(facilityIds)
        User.findAll({
            include: [
              {
                model: Facility,
                through: { attributes: [] },
                where:{facilityId:facilityIds}
              },
              {
                model: Role,
                through: { attributes: [] },
                attributes: ["roleId"],
                where:{roleId:1}
              }
            ],
            attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName', 'createdAt']
          }).then((user) => {
            res.json({ success: true, data: user });
          }).catch(next);
    } else {
      res.status(401).json({ success: false, data: "User not authorized." });
    }
  });
});

module.exports = router;
