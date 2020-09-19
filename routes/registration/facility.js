const express = require('express');
const router = express.Router();
var twilio = require('twilio');

const Twilio = require('../../models').Twilio;
const User = require('../../models').User;
const Facility = require('../../models').Facility;
const Role = require('../../models').Role;
const utils = require('../../utils/validation');
const jwtUtils = require('../../utils/create-jwt');
const requestIp = require('request-ip');

// To create a facility user.

router.post('/registration', function (req, res, next) {
    req.body.user.password = User.generateHash(req.body.user.password);
    User.create(req.body.user).then((createdUser) => {
        Role.findOne({ where: { roleId: 2 } }).then((roles) => {
            Promise.resolve(createdUser.addRole(roles)).then((userRole) => {
                const clientIp = requestIp.getClientIp(req);
                console.log('ipAddress', clientIp)
                Facility.findOne({ where: { ipAddress: clientIp } }).then((foundFacility) => {
                    Promise.resolve(createdUser.addFacility(foundFacility)).then((userFacility) => {
                        res.json({ success: true, data: createdUser });
                    }).catch(next);
                });
            }).catch(next);
        }).catch(next);
    }).catch(next => {
        utils.validator(next, function (err) {
            res.status(400).json(err)
        });
    });
})

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
        } else {
            res.json({ success: false, data: 'invalid auth code' });
        }
    }).catch(next);
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

module.exports = router;