const express = require('express');
const router = express.Router();
var passport = require('passport');
const LegalResearch = require('../models').LegalResearch;
const User = require('../models').User;
const util = require('../utils/validateUser');
const utils = require('../utils/validation')
const UserMeta = require('../models').UserMeta;

/* post legal research. */
router.post('/', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            req.body['userId'] = req.user.userId;
            LegalResearch.create(req.body).then(data => {
                res.json({ success: true, data: data });
            }).catch(next => {
                utils.validator(next, function (err) {
                    res.status(400).json(err)
                })
            })
        } else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


/*get all legal research*/
router.get('/', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            LegalResearch.findAll({
                include: [
                    {
                        model: User, as: 'inmate',
                        attributes: ['userId', 'firstName', 'middleName', 'lastName', 'userName']
                    }
                ],
                where: { userId: req.user.userId }
            }).then(data => {
                res.json({ success: true, data: data });
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

router.get('/:legalResearchId', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            LegalResearch.findOne({
                include: [
                    {
                        model: User, as: 'inmate',
                        attributes: ['userId'],
                        include: [
                            {
                                model: UserMeta,
                            }
                        ]
                    }
                ],
                where: { legalResearchId: req.params.legalResearchId }
            }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next)
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})

/*edit legal research form */

router.put('/:caseId', function (req, res, next) {
    util.validate([1], req.user.roles, function (isAuthenticated) {
        if (isAuthenticated) {
            LegalResearch.update(req.body, { where: { legalResearchId: req.params.legalResearchId } }).then(data => {
                res.json({ success: true, data: data });
            }).catch(next => {
                utils.validator(next, function (err) {
                    res.status(400).json(err)
                })
            })
        }
        else {
            res.status(401).json({ success: false, data: 'User not authorized.' });
        }
    })
})


module.exports = router;