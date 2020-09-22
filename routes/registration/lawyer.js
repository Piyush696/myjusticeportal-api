const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
var twilio = require('twilio');

const Twilio = require('../../models').Twilio;
const User = require('../../models').User;
const Address = require('../../models').Address;
const Organization = require('../../models').Organization;
const Facility = require('../../models').Facility;
const Role = require('../../models').Role;
const utilsMail = require('../../utils/admin-notification');
const jwtUtils = require('../../utils/create-jwt');
const UserMeta = require('../../models').UserMeta;

// To create a admin lawyer.

router.post('/registration', function (req, res, next) {
    req.body.user.password = User.generateHash(req.body.user.password);
    req.body.user.isAdmin = true;
    User.create(req.body.user).then((createdUser) => {
        req.body.userMeta.map((element) => {
            element['userId'] = createdUser.userId
            element['createdBy'] = createdUser.userId
        })
        UserMeta.bulkCreate(req.body.userMeta).then(() => {
            Address.create(req.body.organization.address).then((createdAddress) => {
                req.body.organization.orgCode = uuidv1();
                req.body.organization.type = 'lawyer';
                req.body.organization.addressId = createdAddress.addressId;
                Organization.create(req.body.organization).then((createdOrg) => {
                    User.update({ organizationId: createdOrg.organizationId },
                        { where: { userId: createdUser.userId } }
                    ).then(() => {
                        Facility.findAll({ where: { facilityId: req.body.facilityIds } }).then((foundFacility) => {
                            return Role.findOne({ where: { roleId: 3 } }).then((roles) => {
                                Promise.resolve(createdUser.addRole(roles)).then(() => {
                                    Promise.resolve(createdOrg.addFacility(foundFacility)).then(() => {
                                        return res.json({ success: true, data: createdUser });
                                    }).catch(next);
                                }).catch(next);
                            }).catch(next);
                        }).catch(next);
                    }).catch(next);
                }).catch(next);
            }).catch(next);
        })
    }).catch(next);
});

router.post('/authenticate/registration', async function (req, res, next) {
    let code = generateCode();
    Twilio.findOne({ where: { twilioId: 1 } }).then(twilioCredentials => {
        var client = new twilio(twilioCredentials.accountSid, twilioCredentials.authToken);
        client.messages.create({
            body: 'My Justice Portal' + ': ' + code + ' - This is your verification code.',
            to: '+' + req.body.countryCode + req.body.mobile,  // Text this number
            from: twilioCredentials.from // From a valid Twilio number
        }).then((message) => {
            User.update({ authCode: code, mobile: req.body.mobile, countryCode: req.body.countryCode },
                {
                    where: { userName: req.body.userName }
                }).then((user) => {
                    res.json({ success: true });
                }).catch(next)
        }).catch((err) => {
            res.json({ success: false });
        })
    })
});

router.post('/verify-sms/registration', async function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Role, through: {
                    attributes: []
                }
            },
            {
                model: Facility, through: {
                    attributes: []
                }
            },
            {
                model: Organization,
            }
        ],
        where: { userName: req.body.userName }
    }).then((data) => {
        let date = new Date();
        let x = date - data.dataValues.updatedAt;
        x = Math.round((x / 1000) / 60);
        if (x <= 5 && data.dataValues.authCode == req.body.otp) {
            jwtUtils.createJwt(data.dataValues, req.body.rememberMe, function (token) {
                if (token) {
                    res.json({ success: true, token: token });
                } else {
                    res.json({ success: false });
                }
            });
            utilsMail.notifyAdmin(data.dataValues, req);
        } else {
            res.json({ success: false, data: 'invalid auth code' });
        }
    }).catch((next) => {
        console.log(next)
    });
})

// To update invited user data.

router.post('/invitedUserUpdate', async function (req, res, next) {
    req.body.password = User.generateHash(req.body.password);
    User.update(req.body, {
        where: { userName: req.body.userName }
    }).then((updatedUser) => {
        res.json({ success: true });
    });
});

// function to generate random code.

function generateCode() {
    let digits = '0123456789';
    let Code = '';
    for (let i = 0; i < 6; i++) {
        Code += digits[Math.floor(Math.random() * 10)];
    }
    return Code;
}

// router.post('/userCreate', async function (req, res, next) {
//     // First, we start a transaction and save it into a variable
//     const t = await sequelize.transaction();
//     req.body.user.password = User.generateHash(req.body.user.password);
//     req.body.user.isAdmin = true;
//     try {
//         const user = await User.create(req.body.user, { transaction: t }).then((createdUser) => {
//             Role.findOne({ where: { roleId: 3 } }).then((roles) => {
//                 user.addRole(roles, { transaction: t }).then((userRole) => {
//                     // If the execution reaches this line, no errors were thrown.
//                     // We commit the transaction.
//                     await t.commit();
//                 })
//             })
//         })
//     }
//     catch (error) {
//         // If the execution reaches this line, an error was thrown.
//         // We rollback the transaction.
//         await t.rollback();
//     }
// })




module.exports = router;