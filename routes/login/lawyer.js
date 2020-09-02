const router = require('express').Router();
const jwt = require('jsonwebtoken');
var passport = require('passport');
const User = require('../../models').User;
const config = require('../../config/config');
const Twilio = require('../../models').Twilio;
var twilio = require('twilio');
const Role = require('../../models').Role;
var Facility = require('../../models').Facility;


/* Login user. */
router.post('/login', function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Role, through: {
                    attributes: []
                },
            },
            {
                model: Facility, through: {
                    attributes: []
                },
            }
        ],
        where: { userName: req.body.userName }
    }).then((user) => {
        if (!user) {
            res.json({ success: false, data: 'Invalid User.' })
        }
        else if (user && !user.isValidPassword(req.body.password)) {
            res.json({ success: false, data: 'Invalid Password.' })
        }
        else {
            if (user.isMFA && user.status) {
                if (user.mobile && user.countryCode) {
                    Twilio.findOne({ where: { twilioId: 1 } }).then(twilioCredentials => {
                        let code = generateCode();
                        var client = new twilio(twilioCredentials.accountSid, twilioCredentials.authToken);
                        client.messages.create({
                            body: 'My Justice Portal' + ': ' + code + ' - This is your verification code.',
                            to: '+' + user.countryCode + user.mobile,  // Text this number
                            from: twilioCredentials.from // From a valid Twilio number
                        }).then((message) => {
                            User.update({ authCode: code }, { where: { userId: user.dataValues.userId } }).then(() => {
                                res.json({ success: false, data: 'Please Enter Your auth code.' })
                            }).catch(next)
                        }).catch((err) => {
                            res.json({ success: false })
                        })
                    })
                }
                else {
                    res.json({ success: false, data: 'Please Register your Mobile Number.' })
                }
            }
            else if (user.isMFA && !user.status) {
                res.json({ success: false, data: 'Your account is under review. Please contact Administrator to activate your account.' })
            }
            else {
                if (!user.isMFA && !user.status) {
                    res.json({ success: false, data: 'Please complete your registration.' })
                }
                else {
                    let expiresIn = req.body.rememberMe ? '15d' : '1d';
                    let token = jwt.sign({
                        userId: user.userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userName: user.userName,
                        role: user.roles,
                        facilities: user.facilities
                    }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
                    res.json({
                        success: true,
                        token: token
                    });
                }
            }
        }
    }).catch(next)
});

//function to generate random code
function generateCode() {
    let digits = '0123456789';
    let Code = '';
    for (let i = 0; i < 6; i++) {
        Code += digits[Math.floor(Math.random() * 10)];
    }
    return Code;
}


/** if ismfa verify otp */
router.post('/verify-otp', async function (req, res, next) {
    User.findOne({
        include: [
            {
                model: Role, through: {
                    attributes: []
                },
            },
            {
                model: Facility, through: {
                    attributes: []
                },
            }
        ],
        where: { userName: req.body.userName }
    }).then((user) => {
        let date = new Date();
        let x = date - user.dataValues.updatedAt;
        let expiresIn = req.body.rememberMe ? '15d' : '1d';
        x = Math.round((x / 1000) / 60);
        if (x <= 5 && user.dataValues.authCode == req.body.otp) {
            let token = jwt.sign({
                userId: user.dataValues.userId,
                firstName: user.dataValues.firstName,
                lastName: user.dataValues.lastName,
                userName: user.dataValues.userName,
                role: user.dataValues.roles,
                facilities: user.facilities
            }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
            res.json({ success: true, token: token })
        } else {
            res.json({ success: false, data: 'invalid otp' })
        }
    }).catch(next)
})
module.exports = router;