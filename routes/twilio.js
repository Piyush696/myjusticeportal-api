const express = require('express');
var twilio = require('twilio');
const router = express.Router();
var passport = require('passport');
const User = require('../models').User;
var accountSid = 'AC5ed469836ea76d5e9354c184e4900479';
var authToken = 'c11ba3fa21acb733e38f4f20eedb4ed9';
var client = new twilio(accountSid, authToken);



function generateCode() {
    let digits = '0123456789';
    let Code = '';
    for (let i = 0; i < 6; i++) {
        Code += digits[Math.floor(Math.random() * 10)];
    }
    return Code;
}


router.post('/', async function (req, res, next) {
    let code = generateCode();

    client.messages.create({
        body: 'My Justice Portal' + ': ' + code + ' - This is your verification code.',
        to: '+' + req.body.countryCode + req.body.mobile,  // Text this number
        from: '+14048003419' // From a valid Twilio number
    }).then((message) => {
        User.update({ authCode: code }, { where: { email: req.body.email } }).then(() => {
            res.json({ success: true })
        }).catch(next)
    }).catch((err) => {
        res.json({ success: false })
    })

});



router.post('/verify-sms', passport.authenticate('jwt', { session: false }), async function (req, res, next) {

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

})


module.exports = router;