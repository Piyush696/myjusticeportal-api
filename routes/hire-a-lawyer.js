const express = require("express");
const router = express.Router();

const User = require("../models").User;
const Organization = require("../models").Organization;
const Address = require("../models").Address;
const Case = require("../models").Case;
const Lawyer_case = require("../models").lawyer_case;
const Files = require("../models").Files;
const Facility = require("../models").Facility;
const utils = require("../utils/file");
const util = require("../utils/validateUser");
const UserAdditionalInfo = require("../models").UserAdditionalInfo;
const Role = require("../models").Role;
const Lawyer_facility = require("../models").lawyer_facility;

router.get("/lawyer/organization/:userId", function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({
                    include: [{
                        model: Organization,
                        attributes: [
                            "organizationId",
                            "name",
                            "tagline",
                            "description",
                            "specialty",
                            "colorPiker",
                        ],
                        include: [{
                                model: Address,
                            },
                            {
                                model: Files,
                                as: "logo",
                            },
                        ],
                    }, ],
                    where: { userId: req.params.userId },
                })
                .then((data) => {
                    res.json({ success: true, data: data });
                })
                .catch(next);
        }
    });
});

router.get("/organizations", function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findAll({
                    include: [{
                            model: Facility,
                            as: "lawyerFacility",
                            where: { facilityId: req.user.facilities[0].facilityId },
                        },
                        {
                            model: Organization,
                            include: [{
                                model: Address
                            }],
                            attributes: [
                                "organizationId",
                                "name"
                            ],
                        },
                        {
                            model: UserAdditionalInfo,
                            include: [{
                                    model: Files,
                                    as: "profile",
                                },
                                {
                                    model: Files,
                                    as: "header",
                                },
                            ],
                        },
                        {
                            model: Role,
                            through: { attributes: [] },
                            attributes: ["roleId"],
                            where: { roleId: 3 },
                        },
                    ],
                    attributes: [
                        "userId",
                        "firstName",
                        "middleName",
                        "lastName",
                        "userName",
                        "createdAt",
                    ],
                    where: { status: true }
                })
                .then((user) => {
                    res.json({ success: true, data: user });
                })
                .catch(next);
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    });
});

// get users of organisation.
router.get("/organizations/:organizationId", function(req, res, next) {
    Organization.findOne({
            include: [{
                    model: Address,
                },
                {
                    model: User,
                    attributes: [
                        "userId",
                        "firstName",
                        "middleName",
                        "lastName",
                        "userName",
                        "createdAt",
                    ],
                },
                {
                    model: Files,
                    as: "logo",
                },
            ],
            where: { organizationId: parseInt(req.params.organizationId) },
            attributes: [
                "organizationId",
                "name",
                "orgCode",
                "tagline",
                "description",
                "type",
                "specialty",
            ],
        })
        .then((data) => {
            res.json({ success: true, data: data });
        })
        .catch(next);
});

//set lawyer case
router.post("/", function(req, res, next) {
    req.body.selectedCases.map((element) => {
        element["status"] = "Requested";
    });
    Lawyer_case.bulkCreate(req.body.selectedCases)
        .then((lawyerCases) => {
            res.json({ success: true, data: lawyerCases });
        })
        .catch(next);
});

// To get all requested cases.

router.post("/requested-cases", function(req, res, next) {
    util.validate([3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_case.findAll({
                where: { status: req.body.status, lawyerId: req.user.userId },
            }).then((foundLawyerCases) => {
                let caseIds = foundLawyerCases.map((data) => data.caseId);
                User.findOne({
                    include: [{
                        model: Case,
                        as: "lawyer",
                        where: { caseId: caseIds },
                        include: [{
                                model: Files,
                                as: "caseFile",
                                attributes: [
                                    "fileId",
                                    "fileName",
                                    "createdAt",
                                    "updatedAt",
                                    "createdByUserId",
                                ],
                            },
                            {
                                model: User,
                                as: "inmate",
                                attributes: ["userId", "firstName", "middleName", "lastName"],
                            },
                        ],
                    }, ],
                    where: { userId: req.user.userId },
                    attributes: ["userId"],
                }).then((caseData) => {
                    res.json({ success: true, data: caseData });
                });
            });
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    });
});

// To get single requested case.

router.get("/requested-case/:caseId", function(req, res, next) {
    util.validate([3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({
                include: [{
                    model: Case,
                    as: "lawyer",
                    include: [{
                            model: Files,
                            as: "caseFile",
                            attributes: [
                                "fileId",
                                "fileName",
                                "filetype",
                                "createdAt",
                                "updatedAt",
                                "createdByUserId",
                            ],
                        },
                        {
                            model: User,
                            as: "inmate",
                            attributes: ["userId", "firstName", "middleName", "lastName"],
                        },
                    ],
                    where: { caseId: req.params.caseId },
                }, ],
                where: { userId: req.user.userId },
                attributes: ["userId"],
            }).then((caseData) => {
                res.json({ success: true, data: caseData });
            });
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    });
});

// To set data after case Approved.

router.post("/approve-case", function(req, res, next) {
    util.validate([3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_case.update({ status: "Approved" }, {
                where: {
                    lawyer_caseId: req.body.lawyer_caseId,
                    lawyerId: req.user.userId,
                },
            }).then((uploaded) => {
                res.json({ success: true });
            });
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    });
});

// To set data after case Rejected.

router.post("/reject-case", function(req, res, next) {
    util.validate([3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_case.update({ status: "Rejected" }, {
                where: {
                    lawyer_caseId: req.body.lawyer_caseId,
                    lawyerId: req.user.userId,
                },
            }).then(() => {
                res.json({ success: true });
            });
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    });
});

// To set data after case Hide.

router.post("/hide/hide-case", function(req, res, next) {
    util.validate([3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Lawyer_case.update({ isHide: req.body.isHide }, {
                where: { caseId: req.body.caseId, lawyerId: req.user.userId },
            }).then(() => {
                res.json({ success: true });
            });
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    });
});

// To get file DownloadLink.

router.post("/fileDownloadLink", function(req, res, next) {
    util.validate([3], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            Case.findOne({
                    where: { userId: req.body.userId, caseId: req.body.caseId },
                    attributes: ["caseId"],
                    include: [{
                        model: Files,
                        as: "caseFile",
                        attributes: [
                            "fileId",
                            "bucket",
                            "fileName",
                            "createdAt",
                            "updatedAt",
                            "createdByUserId",
                        ],
                        where: { fileId: req.body.fileId },
                    }, ],
                })
                .then((data) => {
                    utils.getSingleSignedURL(data.caseFile[0], function(downloadLink) {
                        if (downloadLink) {
                            res.json({ success: true, data: downloadLink });
                        } else {
                            res.json({ success: false });
                        }
                    });
                })
                .catch(next);
        } else {
            res.status(401).json({ success: false, data: "User not authorized." });
        }
    });
});

router.get('/getLawyerInfo/:userId', function(req, res, next) {
    util.validate([1], req.user.roles, function(isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({
                include: [{
                        model: Organization
                    },
                    {
                        model: UserAdditionalInfo,
                        include: [{
                                model: Files,
                                as: 'profile'
                            },
                            {
                                model: Files,
                                as: 'header'
                            }
                        ]
                    }
                ],
                where: { userId: req.params.userId }
            }).then((users) => {
                res.json({ success: true, data: users });
            });
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    });
})

module.exports = router;