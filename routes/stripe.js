const express = require("express");
const router = express.Router();
const request = require("request");
const User = require("../models").User;
const UserMeta = require("../models").UserMeta;
const Facility = require("../models").Facility;
const Lawyer_Facility = require("../models").lawyer_facility;
const Defender_Facility = require("../models").defender_facility;
var passport = require("passport");
const { Op } = require("sequelize");
var StripeConnection = require("../models").StripeConnection
var user_plan = require("../models").user_plan
var Stripe = require('stripe');
const Address = require('../models').Address;
const Organization = require('../models').Organization;

// create customer   **Step-1

router.post("/", async function(req, res, next) {
    StripeConnection.findOne({
        attributes: ['authKey'],
        where: { stripeId: 1 }
    }).then((key) => {
        User.findOne({
            include: [{
                model: Organization,
                attributes: ['organizationId'],
                include: [{
                    model: Address
                }]
            }],
            attributes: ["userId", "firstName", "middleName", "lastName"],
            where: { userName: req.body.email }
        }).then((user) => {
            let stripe = Stripe(key.dataValues.authKey);
            let name = user.firstName + ' ' + user.middleName + ' ' + user.lastName
            if (req.body.cus_id == undefined) {
                stripe.customers
                    .create({
                        email: req.body.email,
                        name: name,
                        address: {
                            line1: user.Organization.Address.street1,
                            postal_code: user.Organization.Address.zip,
                            city: user.Organization.Address.city,
                            state: user.Organization.Address.state,
                            country: user.Organization.Address.country,
                        },
                    })
                    .then((customer) => {
                        stripe.customers
                            .createSource(customer.id, {
                                source: req.body.token,
                            })
                            .then((addCard) => {
                                res.json({ success: true, data: addCard });
                            })
                            .catch(() => {
                                res.json({ success: false, data: customer.id });
                            });
                    })
                    .catch(next);
            } else {
                stripe.customers
                    .createSource(req.body.cus_id, {
                        source: req.body.token,
                    })
                    .then((addCard) => {
                        res.json({ success: true, data: addCard });
                    }).catch(next);
            }
        })
    })
});

// charge api
router.post('/charge', async function(req, res, next) {
    StripeConnection.findOne({
        attributes: ['authKey', 'productId'],
        where: { stripeId: 1 }
    }).then((key) => {
        let stripe = Stripe(key.dataValues.authKey);
        stripe.charges.create({
            amount: req.body.amount,
            currency: 'usd',
            description: 'lawyer Payment',
            // interval: 'month',
            customer: req.body.strip_custId,
        }).then((charge) => {
            deleteLawyerFacilityAddons(
                req.body.userId, req.body.type, next,
                function(deleteFacilityLawyer) {
                    if (deleteFacilityLawyer) {
                        setLawyerFacilityAddons(
                            req.body.facilityList, next,
                            function(setFacilityLawyer) {
                                if (setFacilityLawyer) {
                                    res.json({ success: true, data: charge })
                                }
                            }
                        );
                    }
                }
            );

        })
    }).catch(next)
})


// plan subscribe

router.post("/subscribe_plan", async function(req, res, next) {
    StripeConnection.findOne({
        attributes: ['authKey', 'productId'],
        where: { stripeId: 1 }
    }).then((key) => {
        let stripe = Stripe(key.dataValues.authKey);
        stripe.prices
            .create({
                unit_amount: req.body.amount,
                currency: 'usd',
                recurring: { interval: 'month' },
                product: key.dataValues.productId,
            })
            .then((price) => {
                stripe.subscriptions
                    .create({
                        customer: req.body.customer,
                        items: [{
                            price: price.id,
                        }],
                        // coupon: 'YC8v1HeL',
                        coupon: req.body.coupon,
                    })
                    .then((subscribePlan) => {
                        let userMetaList = [{
                                metaKey: "sub_id",
                                metaValue: subscribePlan.id,
                                userId: req.body.userId,
                                createdBy: req.body.userId,
                            },
                            {
                                metaKey: "cust_id",
                                metaValue: req.body.customer,
                                userId: req.body.userId,
                                createdBy: req.body.userId,
                            },
                        ];
                        UserMeta.bulkCreate(userMetaList)
                            .then((result) => {
                                if (result) {
                                    deleteLawyerFacilityAddons(req.body.userId, req.body.type, next, function(deleteLawyerFacility) {
                                        if (deleteLawyerFacility) {
                                            setLawyerFacilityAddons(
                                                req.body.facilityList, next,
                                                function(setFacilityLawyer) {
                                                    if (setFacilityLawyer) {
                                                        let plan;
                                                        if (req.body.facilityList && req.body.facilityList[0].planSelected) {
                                                            plan = req.body.facilityList[0].planSelected
                                                        } else {
                                                            plan = 'Unlimited Connections';
                                                        }
                                                        let x = {
                                                            "plan": plan,
                                                            "totalAmount": req.body.amount / 100,
                                                            "coupon": req.body.coupon,
                                                            "discount": req.body.discount,
                                                            "isActive": true,
                                                            'userId': req.body.userId
                                                        }
                                                        user_plan.create(x).then((user_plan) => {
                                                            res.json({ success: true, data: user_plan });
                                                        }).catch(next);
                                                    }
                                                }
                                            );
                                        }
                                    })
                                }
                            }).catch(next);
                    }).catch(next);
            }).catch(next);
    })
});

/* Validate card */

router.post("/validate_card", async function(req, res, next) {
    StripeConnection.findOne({
        attributes: ['authKey'],
        where: { stripeId: 1 }
    }).then((key) => {
        let stripe = Stripe(key.dataValues.authKey);
        stripe.tokens
            .create({
                card: {
                    number: req.body.number,
                    exp_month: "12",
                    exp_year: new Date().getFullYear() + 1,
                    cvc: "123",
                },
            })
            .then((token) => {
                res.json({ success: true, data: token });
            })
            .catch(next);
    })
});

/* validate coupon */

router.post("/validate_coupan", async function(req, res, next) {
    StripeConnection.findOne({
        attributes: ['authKey'],
        where: { stripeId: 1 }
    }).then((key) => {
        let stripe = Stripe(key.dataValues.authKey);
        stripe.coupons
            .retrieve(req.body.coupon)
            .then((coupon) => {
                res.json({ success: true, data: coupon });
            })
            .catch(next);
    })
});


router.get('/subcription_details', passport.authenticate("jwt", { session: false }), async function(req, res, next) {
    User.findOne({
        include: [{
            model: UserMeta,
            where: {
                metaKey: {
                    $or: [
                        { $eq: 'cust_id' },
                        { $eq: 'sub_id' }
                    ]
                }
            },
        }, ],
        attributes: ["userId"],
        where: { userId: req.user.userId },
    }).then((user) => {
        let stripeData = user.userMeta.find(x => x.metaKey == 'cust_id')
        StripeConnection.findOne({
            attributes: ['authKey'],
            where: { stripeId: 1 }
        }).then((key) => {
            let stripe = Stripe(key.authKey);
            stripe.customers.retrieve(stripeData.metaValue).then((customer) => {
                stripe.customers.retrieveSource(
                    customer.id,
                    customer.default_source
                ).then((cardDetails) => {
                    res.json({ success: true, data: cardDetails })
                })
            }).catch(next);
        })
    }).catch(next);
})



/* update card */
router.post("/update_card", passport.authenticate("jwt", { session: false }), async function(req, res, next) {
    User.findOne({
        include: [{
            model: UserMeta,
            where: {
                metaKey: {
                    $or: [
                        { $eq: 'cust_id' }
                    ]
                }
            },
        }, ],
        attributes: ["userId"],
        where: { userId: req.user.userId },
    }).then((user) => {
        StripeConnection.findOne({
            attributes: ['authKey'],
            where: { stripeId: 1 }
        }).then((key) => {
            let custId = user.userMeta.find(x => x.metaKey === 'cust_id')
            let stripe = Stripe(key.dataValues.authKey);
            stripe.customers
                .retrieve(custId.metaValue)
                .then((customer) => {
                    stripe.customers
                        .createSource(customer.id, { source: req.body.token })
                        .then((createSource) => {
                            stripe.customers
                                .deleteSource(custId.metaValue, customer.default_source)
                                .then(() => {
                                    res.json({ success: true, data: createSource });
                                }).catch(next);
                        }).catch(next);
                }).catch(next);
        }).catch(next);
    });
});



/*update plan */
router.post("/update_plan", passport.authenticate("jwt", { session: false }), async function(req, res, next) {
    User.findOne({
        include: [{
            model: UserMeta,
            where: {
                metaKey: {
                    $or: [
                        { $eq: 'cust_id' },
                        { $eq: 'sub_id' }
                    ]
                }
            },
        }, ],
        attributes: ["userId"],
        where: { userId: req.user.userId },
    }).then((user) => {
        let subId = user.userMeta.filter(x => x.metaKey === 'sub_id')
        let cusId = user.userMeta.filter(x => x.metaKey === 'cust_id')
        StripeConnection.findOne({
            attributes: ['authKey', 'productId'],
            where: { stripeId: 1 }
        }).then((key) => {
            let stripe = Stripe(key.dataValues.authKey);
            stripe.subscriptions
                .del(user.userMeta[0].metaValue)
                .then(() => {
                    stripe.prices
                        .create({
                            unit_amount: req.body.amount,
                            currency: 'usd',
                            recurring: { interval: 'month' },
                            product: key.dataValues.productId
                        })
                        .then((price) => {
                            stripe.subscriptions
                                .create({
                                    customer: user.userMeta[1].metaValue,
                                    items: [{
                                        price: price.id,
                                    }],
                                    coupon: req.body.coupon,
                                })
                                .then((subscribePlan) => {
                                    deleteLawyerFacilityAddons(req.body.userId, req.body.type, next, function(deleteFacilityLawyer) {
                                        if (deleteFacilityLawyer) {
                                            setLawyerFacilityAddons(req.body.facilityList, next, function(setFacilityLawyer) {
                                                if (setFacilityLawyer) {
                                                    UserMeta.update({
                                                        metaValue: subscribePlan.id,
                                                    }, {
                                                        where: {
                                                            metaKey: "sub_id",
                                                            userId: req.user.userId,
                                                        },
                                                    }).then(() => {
                                                        let plan;
                                                        if (req.body.facilityList && req.body.facilityList[0].planSelected) {
                                                            plan = req.body.facilityList[0].planSelected
                                                        } else {
                                                            plan = 'Unlimited Connections';
                                                        }
                                                        let x = {
                                                            "plan": plan,
                                                            "totalAmount": req.body.amount / 100,
                                                            "coupon": req.body.coupon,
                                                            "discount": req.body.discount,
                                                            "isActive": true,
                                                            'userId': req.user.userId
                                                        }
                                                        user_plan.update({ isActive: false }, { where: { userId: req.user.userId, isActive: true } }).then(() => {
                                                            user_plan.create(x).then((user_plan) => {
                                                                res.json({ success: true, data: user_plan });
                                                            }).catch(next);
                                                        }).catch(next)
                                                    }).catch(next);
                                                }
                                            });
                                        }
                                    });
                                }).catch(next);
                        }).catch(next);

                }).catch(next);
        })
    });
});


function deleteLawyerFacilityAddons(userId, type, next, callback) {
    if (type == 'lawyer') {
        Lawyer_Facility.findAll({ where: { lawyerId: userId } }).then(
            (lawyerFacility) => {

                if (lawyerFacility && lawyerFacility.length > 0) {
                    let count = 0;
                    lawyerFacility.forEach((element, index, Array) => {
                        Lawyer_Facility.destroy({
                            where: { lawyer_facilityId: element.lawyer_facilityId },
                        }).then((data) => {
                            if (count === Array.length - 1) {
                                callback(data);
                            }
                            count++;
                        });
                    });
                } else {
                    callback(true);
                }

            }).catch(next)
    }
    if (type == 'defender') {
        Defender_Facility.findAll({ where: { defenderId: userId } }).then(
            (defenderFacility) => {
                if (defenderFacility && defenderFacility.length > 0) {
                    let count = 0;
                    defenderFacility.forEach((element, index, Array) => {
                        Defender_Facility.destroy({
                            where: { defender_facilityId: element.defender_facilityId },
                        }).then((data) => {
                            if (count === Array.length - 1) {
                                callback(data);
                            }
                            count++;
                        });
                    });
                } else {
                    callback(true);
                }
            });
    }

}

function setLawyerFacilityAddons(facilityList, next, callback) {
    let count = 0;
    let count1 = 0;
    facilityList.forEach((element, index, Array) => {

        if (element.defenderId) {
            Defender_Facility.create(element)
                .then((result) => {
                    if (count1 === Array.length - 1) {
                        callback(result);
                    }
                    count1++;
                }).catch(next)
        } else if (element.lawyerId) {
            Lawyer_Facility.create(element)
                .then((result) => {
                    if (count === Array.length - 1) {
                        callback(result);
                    }
                    count++;
                }).catch(next)
        }
    });
}




module.exports = router;