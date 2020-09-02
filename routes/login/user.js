const router = require('express').Router();
const jwt = require('jsonwebtoken');
var passport = require('passport');
const User = require('../../models').User;
const config = require('../../config/config');
const Twilio = require('../../models').Twilio;
var twilio = require('twilio');
const Role = require('../../models').Role;
var Facility = require('../../models').Facility;


router.post('/', function (req, res, next) {
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
            if (user.facilities[0].facilityCode == req.body.facilityCode) {
                if (!user.isMFA && user.status) {
                    let expiresIn = req.body.rememberMe ? '15d' : '1d';
                    let token = jwt.sign({
                        userId: user.userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userName: user.userName,
                        role: user.roles,
                        facility: user.facilities
                    }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
                    res.json({ success: true, token: token })
                }
                else {
                    res.json({ success: false, data: 'Inactive User.' })
                }
            }
            else {
                res.json({ success: false, data: 'User not registered to this facility.' })
            }
        }
    }).catch(next)
});
module.exports = router;