const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const facility = require('../../models/facility');

const User = require('../../models').User;
const Address = require('../../models').Address;
const Organization = require('../../models').Organization;
const Facility = require('../../models').Facility;
const Role = require('../../models').Role;

// To a admin lawyer.

router.post('/registration', function (req, res, next) {
    req.body.user.password = User.generateHash(req.body.user.password);
    req.body.user.isAdmin = true;
    req.body.user.isMFA = true;
    req.body.organization.orgCode = generateOrgCode();
    User.create(req.body.user).then((createdUser) => {
        Address.create(req.body.organization.address).then((createdAddress) => {
            req.body.organization.addressId = createdAddress.addressId;
            Organization.create(req.body.organization).then((createdOrg) => {
                User.update({ organizationId: createdOrg.organizationId },
                    { where: { userId: createdUser.userId } }
                ).then((updatedUser) => {
                    Facility.findAll({ where: { facilityId: req.body.facilityIds } }).then((foundFacility) => {
                        Promise.resolve(createdUser.addFacility(foundFacility)).then((userFacility) => {
                            Role.findOne({ where: { roleId: 2 } }).then((roles) => {
                                Promise.resolve(createdUser.addRole(roles)).then((userRole) => {
                                    Promise.resolve(createdOrg.addFacility(foundFacility)).then((userOrg) => {
                                        res.json({ success: true, data: createdUser });
                                    }).catch(next);
                                }).catch(next);
                            }).catch(next);
                        }).catch(next);
                    }).catch(next);
                }).catch(next);
            }).catch(next);
        }).catch(next);
    }).catch(next);
});

// function to generate random code.

function generateOrgCode() {
    let digits = '0123456789';
    let Code = '';
    for (let i = 0; i < 10; i++) {
        Code += digits[Math.floor(Math.random() * 10)];
    }
    return Code;
}

module.exports = router;