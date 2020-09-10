const express = require('express');
var twilio = require('twilio');
const router = express.Router();
const User = require('../models').User;
const Twilio = require('../models').Twilio;
const util = require('../utils/validateUser');


//function to generate random code
function generateCode() {
    let digits = '0123456789';
    let Code = '';
    for (let i = 0; i < 6; i++) {
        Code += digits[Math.floor(Math.random() * 10)];
    }
    return Code;
}

/**generate otp after registration*/
router.post('/', async function (req, res, next) {
    util.validate([7], req.user.role, function (isAuthenticated) {
        if (isAuthenticated) {
            let code = generateCode();
            Twilio.findOne({ where: { twilioId: 1 } }).then(twilioCredentials => {
                var client = new twilio(twilioCredentials.accountSid, twilioCredentials.authToken);
                client.messages.create({
                    body: 'My Justice Portal' + ': ' + code + ' - This is your verification code.',
                    to: '+' + req.body.countryCode + req.body.mobile,  // Text this number
                    from: twilioCredentials.from // From a valid Twilio number
                }).then((message) => {
                    User.update({ authCode: code, mobile: req.body.mobile, countryCode: req.body.countryCode }, { where: { userId: req.user.userId } }).then(() => {
                        res.json({ success: true })
                    }).catch(next)
                }).catch((err) => {
                    res.json({ success: false })
                })
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
});


/**verify otp */
router.post('/verify-sms', async function (req, res, next) {
    util.validate([7], req.user.role, function (isAuthenticated) {
        if (isAuthenticated) {
            User.findOne({ where: { userId: req.user.userId } }).then((data) => {
                let date = new Date();
                let x = date - data.dataValues.updatedAt;
                x = Math.round((x / 1000) / 60);
                if (x <= 5 && data.dataValues.authCode == req.body.otp) {
                    res.json({ success: true, data: data })
                } else {
                    res.json({ success: false, data: 'invalid otp' })
                }
            }).catch(next)
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


/* get twilio Credencials. */
router.get('/', function (req, res, next) {
    util.validate([7], req.user.role, function (isAuthenticated) {
        if (isAuthenticated) {
            Twilio.findOne({ where: { twilioId: 1 } }).then(twilio => {
                res.json({ success: true, data: twilio });
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


/*update twilio Credencials */
router.post('/twilio', function (req, res, next) {
    util.validate([7], req.user.role, function (isAuthenticated) {
        if (isAuthenticated) {
            Twilio.findOne({ where: { twilioId: 1 } }).then(twilio => {
                if (twilio) {
                    Twilio.update(req.body, {
                        where: { twilioId: 1 }
                    }).then((user) => {
                        res.json({ success: true, data: user });
                    }).catch(next);
                }
                else {
                    Twilio.create(req.body).then((user) => {
                        res.json({ success: true, data: user });
                    }).catch(next);
                }
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


module.exports = router;