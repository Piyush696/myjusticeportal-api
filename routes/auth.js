const router = require('express').Router();
const jwt = require('jsonwebtoken');
var passport = require('passport');
var twilio = require('twilio');

const config = require('../config/config');
const User = require('../models').User;
const Role = require('../models').Role;
const Twilio = require('../models').Twilio;
const Facility = require('../models').Facility;
const jwtUtils = require('../utils/create-jwt');

router.get('/check-token', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.send({ success: true, user: req.user });
});

router.get('/:id?', async function (req, res, next) {
    
    User.findAndCountAll({
        where: { userName: req.query.userName.trim() }
    }).then((users) => {
        if (users.count == 0) {
            return res.json({ taken: false });
        }
        return res.json({ taken: true });
    }).catch(next)
});

/* Login user. */
router.post('/login', function (req, res, next) {
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
    }).then((user) => {
        if (!user) {
            res.json({ success: false, data: 'Invalid User.' });
        }
        else if (user && !user.isValidPassword(req.body.password)) {
            res.json({ success: false, data: 'Invalid Password.' });
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
                            res.json({ success: false });
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
                    jwtUtils.createJwt(user, req.body.rememberMe, function (token) {
                        if (token) {
                            res.json({ success: true, token: token });
                        } else {
                            res.json({ success: false });
                        }
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
            }
        ],
        where: { userName: req.body.userName }
    }).then((user) => {
        let date = new Date();
        let x = date - user.dataValues.updatedAt;
        x = Math.round((x / 1000) / 60);
        if (x <= 5 && user.dataValues.authCode == req.body.otp) {
            jwtUtils.createJwt(user.dataValues, req.body.rememberMe, function (token) {
                if (token) {
                    res.json({ success: true, token: token });
                } else {
                    res.json({ success: false });
                }
            });
        } else {
            res.json({ success: false, data: 'invalid otp' });
        }
    }).catch(next);
})

// To get email by token.

router.patch('/getTokenEmail', function (req, res, next) {
    var decoded = jwt.verify(req.body.token, config.jwt.secret);
    if (decoded) {
        res.json({ success: true, data: decoded.data.userName });
    } else {
        res.json({ success: false, data: 'Somthing went wrong' });
    }
});

module.exports = router;