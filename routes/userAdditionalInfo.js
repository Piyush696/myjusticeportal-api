const express = require("express");
const router = express.Router();

const User = require("../models").User;
const Organization = require("../models").Organization;
const Address = require("../models").Address;
const Case = require("../models").Case;
const UserAdditionalInfo = require("../models").UserAdditionalInfo;
const Files = require("../models").Files;
const Facility = require("../models").Facility;
const Lawyer_case = require("../models").lawyer_case;
const utils = require("../utils/file");
const util = require("../utils/validateUser");
const multer = require("multer");
const { Role } = require("../models");
const Message = require('../models').Messages;
const upload = multer({ dest: "uploads/" });
// To get all requested cases.

router.get("/", function (req, res, next) {
  util.validate([3], req.user.roles, function (isAuthenticated) {
    if (isAuthenticated) {
      User.findOne({
        include: [
          {
            model: Organization
          },
          {
            model: UserAdditionalInfo,
            include: [
              {
                model: Files,
                as: "profile",
              },
              {
                model: Files,
                as: "header",
              },
            ],
          },
        ],
        where: { userId: req.user.userId },
      }).then((users) => {
        res.json({ success: true, data: users });
      });
    } else {
      res.status(401).json({ success: false, data: "User not authorized." });
    }
  });
});

router.post("/uploadProfile", upload.any(), function (req, res, next) {
  util.validate([3], req.user.roles, function (isAuthenticated) {
    console.log(req.files);
    if (isAuthenticated) {
      req.files.forEach((file) => {
        utils.uploadFile(
          file,
          file.mimetype,
          req.user.userId,
          "mjp-public",
          "public-read",
          function (fileId) {
            console.log(fileId);
            if (fileId) {
              if (file.fieldname == 'logo') {
                UserAdditionalInfo.update(
                  { ProfileImgId: fileId, userId: req.user.userId },
                  { where: { userId: req.user.userId } }
                ).then(() => {
                  res.json({ success: true });
                });
              } else {
                UserAdditionalInfo.update(
                  { headerImgId: fileId, userId: req.user.userId },
                  { where: { userId: req.user.userId } }
                ).then(() => {
                  res.json({ success: true });
                });
              }
            }
          }
        );
      });
    } else {
      res.status(401).json({ success: false, data: "User not authorized." });
    }
  });
});

// To set data after case inmate approve.

router.post("/inmateStatus", function (req, res, next) {
  util.validate([1], req.user.roles, function (isAuthenticated) {
    if (isAuthenticated) {
      Lawyer_case.update(
        { status: req.body.status },
        {
          where: { caseId: req.body.caseId, lawyerId: req.body.lawyerId },
        }
      ).then((data) => {
        res.json({ success: true, data: data });
      });
    } else {
      res.status(401).json({ success: false, data: "User not authorized." });
    }
  });
});

router.put("/", function (req, res, next) {
  util.validate([3], req.user.roles, function (isAuthenticated) {
    if (isAuthenticated) {
      UserAdditionalInfo.findOne({ where: { userId: req.user.userId } }).then(
        (user) => {
          if (user) {
            UserAdditionalInfo.update(req.body.additionalInfo, {
              where: { userId: req.user.userId },
            })
              .then((data) => {
                res.json({ success: true, data: data });
              })
              .catch(next);
          } else {
            req.body.additionalInfo["userId"] = req.user.userId;
            UserAdditionalInfo.create(req.body.additionalInfo)
              .then((data) => {
                res.json({ success: true, data: data });
              })
              .catch(next);
          }
        }
      );
    } else {
      res.status(401).json({ success: false, data: "User not authorized." });
    }
  });
});

//list of all organizations those who are linked to a facility and role is lawyer.
router.get("/sponsorsUser", function (req, res, next) {
  util.validate([1], req.user.roles, function (isAuthenticated) {
    if (isAuthenticated) {
      User.findAll({
        include: [
          {
            model: Facility, as: 'lawyerFacility',
            through: { attributes: [] },
            where: { facilityId: req.user.facilities[0].facilityId }
          },
          {
            model: UserAdditionalInfo,
            include: [
              {
                model: Files,
                as: "profile",
              },
            ],
          },
          {
            model: Organization
          },
          {
            model: Role,
            through: { attributes: [] },
            attributes: ["roleId"],
            where: { roleId: 3 }
          }
        ],
      }).then((user) => {
        var n = 2
        randomItems = user.sort(() => .5 - Math.random()).slice(0, n);
        res.json({ success: true, data: randomItems });
      }).catch(next);
    } else {
      res.status(401).json({ success: false, data: "User not authorized." });
    }
  });
});

router.get("/:userId", function (req, res, next) {
  util.validate([1], req.user.roles, function (isAuthenticated) {
    if (isAuthenticated) {
      User.findOne({
        include: [
          {
            model: Organization,
            attributes: [
              "organizationId",
              "name",
              "orgCode",
              "type",
              "specialty",
            ],
          },
          {
            model: UserAdditionalInfo,
          },
        ],
        where: { userId: req.params.userId },
      })
        .then((userData) => {
          res.json({ success: true, data: userData });
        })
        .catch(next);
    } else {
      res.status(401).json({ success: false, data: "User not authorized." });
    }
  });
});

//set lawyer case
router.post("/", function (req, res, next) {
  req.body["status"] = "Lawyer Requested";
  Lawyer_case.create(req.body)
    .then((lawyerCases) => {
      res.json({ success: true, data: lawyerCases });
    })
    .catch(next);
});

// To get all requested cases.

router.get("/lawyer/Cases", function (req, res, next) {
  util.validate([3], req.user.roles, function (isAuthenticated) {
    if (isAuthenticated) {
      Lawyer_case.findAll({
        where: { lawyerId: req.user.userId },
      })
        .then((foundLawyerCases) => {
          let caseIds = foundLawyerCases.map((data) => data.caseId);
          Case.findAll({
            include: [
              {
                model: User,
                as: "inmate",
                attributes: ["userId", "firstName", "lastName", "userName"],
              },
            ],
            where: { caseId: caseIds },
          })
            .then((data) => {
              let count = 0;
              foundLawyerCases.forEach((element, index, Array) => {
                data.map((x) => {
                  if (x.dataValues.caseId === element.dataValues.caseId) {
                    x.dataValues["status"] = element.dataValues.status;
                    x.dataValues["sentAt"] = element.dataValues.updatedAt;
                    if (count === Array.length - 1) {
                      let x = data;
                      res.json({ success: true, data: x });
                    }
                    count++;
                  }
                });
              });
            })
            .catch(next);
        })
        .catch(next);
    } else {
      res.status(401).json({ success: false, data: "User not authorized." });
    }
  });
});

// To set data after case Approved.

router.post("/status-update", function (req, res, next) {
  util.validate([3], req.user.roles, function (isAuthenticated) {
    if (isAuthenticated) {
      Lawyer_case.update(
        { status: req.body.status },
        {
          where: { caseId: req.body.caseId, lawyerId: req.user.userId },
        }
      )
        .then((data) => {
          res.json({ success: true });
        })
        .catch(next);
    } else {
      res.status(401).json({ success: false, data: "User not authorized." });
    }
  });
});


// find lawyer case count
router.get("/dasboard/count", function (req, res, next) {
  util.validate([3], req.user.roles, function (isAuthenticated) {
    if (isAuthenticated) {
      Lawyer_case.findAndCountAll({
        where: { lawyerId: req.user.userId }
      }).then(cases => {
        // res.json({ success: true, data: cases.count });
        Message.findAndCountAll({
          where: {
            $or: [{ senderId: req.user.userId }, { receiverId: req.user.userId }],
          },
        }).then(data => {
          Lawyer_case.findAndCountAll({
            where: { lawyerId: req.user.userId, status: 'Connected' }
          }).then(myCases => {
            let count = {
              caseCount: cases.count,
              messageCount: data.count,
              myCases: myCases.count
            }
            res.json({ success: true, data: count });
          })

        })

      })
    }

  })
})


module.exports = router;
