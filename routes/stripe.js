const express = require("express");
const router = express.Router();
const request = require("request");
const { User } = require("../models");
const UserMeta = require("../models").UserMeta;
const Facility = require("../models").Facility;
const Lawyer_Facility = require("../models").lawyer_facility;
var passport = require("passport");
const { Op } = require("sequelize");
var StripeConnection = require("../models").StripeConnection
var Stripe = require('stripe');


// create customer   **Step-1

router.post("/", async function(req, res, next) {
    StripeConnection.findOne({
        attributes: ['authKey'],
        where: { stripeId: 1 }
    }).then((key) => {
        let stripe = Stripe(key.dataValues.authKey);
        if (req.body.cus_id == undefined) {
            stripe.customers
                .create({
                    email: req.body.email,
                    name: "Piyush",
                    address: {
                        line1: "510 Townsend St",
                        postal_code: "560029",
                        city: "San Francisco",
                        state: "BL",
                        country: "IN",
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
});

// plan subscribe

router.post("/subscribe_plan", async function(req, res, next) {
    StripeConnection.findOne({
        attributes: ['authKey', 'productId'],
        where: { stripeId: 1 }
    }).then((key) => {
        let stripe = Stripe(key.dataValues.authKey);
        stripe.plans
            .create({
                amount: req.body.amount,
                currency: req.body.currency,
                interval: req.body.interval,
                product: key.dataValues.productId,
            })
            .then((plan) => {
                stripe.subscriptions
                    .create({
                        customer: req.body.customer,
                        items: [{
                            plan: plan.id,
                        }],
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
                                    deleteLawyerFacilityAddons(req.body.userId, function(deleteLawyerFacility) {
                                        if (deleteLawyerFacility) {
                                            setLawyerFacilityAddons(
                                                req.body.facilityList,
                                                function(setFacilityLawyer) {
                                                    if (setFacilityLawyer) {
                                                        res.json({ success: true, data: subscribePlan });
                                                    }
                                                }
                                            );
                                        }
                                    })
                                }
                            }).catch(next);
                    }).catch(next);
            })
            .catch(next);
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

router.post(
    "/list-transaction",
    passport.authenticate("jwt", { session: false }),
    async function(req, res, next) {
        User.findOne({
                include: [{
                    model: UserMeta,
                    where: { metaKey: "cust_id" },
                    attributes: ["metaKey", "metaValue"],
                }, ],
                where: { userId: req.user.userId },
                attributes: ["userId", "userName", "firstName", "middleName", "lastName"],
            })
            .then((user) => {
                StripeConnection.findOne({
                        attributes: ['authKey'],
                        where: { stripeId: 1 }
                    }).then((key) => {
                        let stripe = Stripe(key.dataValues.authKey);
                        stripe.customers
                            .listBalanceTransactions(user.userMeta[0].metaValue)
                            .then((transactions) => {
                                res.json({ success: true, data: transactions });
                            })
                            .catch(next);
                    })
                    .catch(next);
            })
    }
);

/* update card */
router.post("/update_card", async function(req, res, next) {
    StripeConnection.findOne({
        attributes: ['authKey'],
        where: { stripeId: 1 }
    }).then((key) => {
        let stripe = Stripe(key.dataValues.authKey);
        stripe.tokens
            .create({
                card: {
                    number: req.body.number,
                    exp_month: req.body.exp_month,
                    exp_year: req.body.exp_year,
                    cvc: req.body.cvc,
                },
            })
            .then((token) => {
                // console.log('token', token)
                stripe.customers
                    .retrieve(req.body.customerId)
                    .then((customer) => {
                        //  console.log('customer', customer)
                        //  console.log('customer', customer.default_source)
                        stripe.customers
                            .createSource(customer.id, { source: token.id })
                            .then((createSource) => {
                                // console.log('createSource', createSource)
                                stripe.customers
                                    .deleteSource(req.body.customerId, customer.default_source)
                                    .then((deletecard) => {
                                        //  console.log('deletecard', deletecard)
                                        res.json({ success: true, data: createSource });
                                    })
                                    .catch(next);
                            })
                            .catch(next);
                    })
                    .catch(next);
            })
            .catch(next);
    })
});

/*update plan */
router.post("/update_plan", passport.authenticate("jwt", { session: false }),
    async function(req, res, next) {
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
            StripeConnection.findOne({
                attributes: ['authKey', 'productId'],
                where: { stripeId: 1 }
            }).then((key) => {
                let stripe = Stripe(key.dataValues.authKey);
                stripe.subscriptions
                    .retrieve(user.userMeta[0].metaValue)
                    .then((data) => {
                        stripe.plans
                            .del(data.items.data[0].plan.id)
                            .then(() => {
                                stripe.plans
                                    .create({
                                        amount: req.body.amount,
                                        currency: "usd",
                                        interval: "month",
                                        product: key.dataValues.productId,
                                    })
                                    .then((plan) => {
                                        stripe.subscriptions
                                            .create({
                                                customer: user.userMeta[1].metaValue,
                                                items: [{
                                                    plan: plan.id,
                                                }, ],
                                            })
                                            .then((subscribePlan) => {
                                                deleteLawyerFacilityAddons(
                                                    req.body.userId,
                                                    function(deleteFacilityLawyer) {
                                                        if (deleteFacilityLawyer) {
                                                            setLawyerFacilityAddons(
                                                                req.body.facilityList,
                                                                function(setFacilityLawyer) {
                                                                    if (setFacilityLawyer) {
                                                                        UserMeta.update({
                                                                                metaValue: subscribePlan.id,
                                                                            }, {
                                                                                where: {
                                                                                    metaKey: "sub_id",
                                                                                    userId: req.user.userId,
                                                                                },
                                                                            })
                                                                            .then((result) => {
                                                                                res.json({
                                                                                    success: true,
                                                                                    data: subscribePlan,
                                                                                });
                                                                            })
                                                                            .catch(next);
                                                                    }
                                                                }
                                                            );
                                                        }
                                                    }
                                                );
                                            })
                                            .catch(next);
                                    })
                                    .catch(next);
                            })
                            .catch(next);
                    })
                    .catch(next);
            })
        });
    }
);

function deleteLawyerFacilityAddons(userId, callback) {
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
        }
    );
}

function setLawyerFacilityAddons(facilityList, callback) {
    let count = 0;
    facilityList.forEach((element, index, Array) => {
        if (element.defenderId) {
            User.findOne({ where: { userId: element.defenderId } }).then((foundUser) => {
                Facility.findOne({ where: { facilityId: element.facilityId } }).then((foundFacility) => {
                    Promise.resolve(foundUser.addFacility(foundFacility)).then(() => {
                        if (count === Array.length - 1) {
                            callback(foundFacility);
                        }
                        count++;
                    })
                })
            })
        } else if (element.lawyerId) {
            Lawyer_Facility.create(element)
                .then((result) => {
                    if (count === Array.length - 1) {
                        callback(result);
                    }
                    count++;
                })
                .catch((next) => {
                    console.log(next);
                });
        }
    });
}

// function setDefenderFacility(facilityList, callback) {
//     console.log(facilityList)
//     let count = 0;
//     facilityList.forEach((element, index, Array) => {
//         User.findOne({ where: { userId: element.defenderId } }).then((foundUser) => {
//             Facility.findOne({ where: { facilityId: element.facilityIds } }).then((foundFacility) => {
//                 Promise.resolve(foundUser.addFacilities(foundFacility)).then(() => {
//                     return res.json({ success: true, data: createdUser });
//                 })
//             }).catch(next);
//         })
//     });
// }


module.exports = router;