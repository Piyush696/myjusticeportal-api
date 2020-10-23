const express = require('express');
const router = express.Router();
const request = require("request");
const UserMeta = require('../models').UserMeta;

// sk_test_zlRA9Hh43Aa6pM80pxdf2mcc00ksE2l4hz
//sk_live_TgvUP4xiCxLmNh4KQx4MxATc00MfApKkpG

var stripe = require('stripe')('sk_test_51HZlF7E0gHnDDynBn1D4La5BtFQKPaNhHTPTjZKFt8tUWgSOISCYGiUzo8zq5Rzshsnvv20P62dA2loctIvjtuKe004GF46zX8');

// create customer   **Step-1 

router.post('/', async function (req, res, next) {
    // console.log("dsjkfhjks", req.body)
    if (req.body.cus_id == undefined) {
        stripe.customers.create({
            email: req.body.email,
            // name: 'Piyush',
            // address: {
            //     line1: '510 Townsend St',
            //     postal_code: '560029',
            //     city: 'San Francisco',
            //     state: 'BL',
            //     country: 'IN',
            // }
        }).then((customer) => {
            // console.log('step-10', customer)
            stripe.tokens.create({
                card: {
                    number: req.body.number,
                    exp_month: req.body.exp_month,
                    exp_year: req.body.exp_year,
                    cvc: req.body.cvc
                }
            }).then((token) => {
                stripe.customers.createSource(
                    customer.id,
                    {
                        source: token.id
                    }).then((addCard) => {
                        res.json({ success: true, data: addCard })
                    }).catch(() => {
                        res.json({ success: false, data: customer.id })
                    }
                    )
            }).catch((addCard) => {
                res.json({ success: false, data: customer.id })
            })
        }).catch(next)
    } else {
        stripe.tokens.create({
            card: {
                number: req.body.number,
                exp_month: req.body.exp_month,
                exp_year: req.body.exp_year,
                cvc: req.body.cvc
            }
        }).then((token) => {
            console.log('step-2', token)
            stripe.customers.createSource(
                req.body.cus_id,
                {
                    source: token.id
                }).then((addCard) => {
                    res.json({ success: true, data: addCard })
                }).catch(next)
        }).catch(next)
    }


})

// plan subscribe

router.post('/subscribe_plan', async function (req, res, next) {
    console.log(req.body)
    var PlanId = "price_1HefExE0gHnDDynBiVzg2Uqu";
    // if (req.body.plan == 'plan_1') {
    //     PlanId = 'plan_FX4LWj4PXPNhrE'  // plan_FX4LWj4PXPNhrE
    // }
    // if (req.body.plan == 'plan_2') {
    //     PlanId = 'plan_FR4gwx0l0OTX4s' //  plan_FR4gwx0l0OTX4s
    // }
    stripe.subscriptions.create({
        customer: req.body.customer,
        items: [
            {
                plan: PlanId,
            },
        ]
    }).then((subscribePlan) => {
        let userMetaList = [{ metaKey: 'sub_id', metaValue: subscribePlan.id, userId: req.body.userId, createdBy: req.body.userId },
        { metaKey: 'cust_id', metaValue: req.body.customer, userId: req.body.userId, createdBy: req.body.userId }]
        UserMeta.bulkCreate(userMetaList).then(() => {
            res.json({ success: true, data: subscribePlan })
        }).catch(next)
    }).catch(next)

})



/* subcription details */

router.post('/subcription_details', async function (req, res, next) {
    stripe.subscriptions.retrieve(req.body.sub_id).then((data) => {
        stripe.customers.retrieve(data.customer).then((customer) => {
            res.json({ success: true, data: customer })
        }).catch(next);
    }).catch(next);
})

/* update card */

router.post('/update_card', async function (req, res, next) {
    stripe.tokens.create({
        card: {
            number: req.body.number,
            exp_month: req.body.exp_month,
            exp_year: req.body.exp_year,
            cvc: req.body.cvc
        }
    }).then((token) => {
        // console.log('token', token)
        stripe.customers.retrieve(req.body.customerId).then((customer) => {
            //  console.log('customer', customer)
            //  console.log('customer', customer.default_source)
            stripe.customers.createSource(customer.id, { source: token.id }).then((createSource) => {
                // console.log('createSource', createSource)
                stripe.customers.deleteSource(req.body.customerId, customer.default_source).then((deletecard) => {
                    //  console.log('deletecard', deletecard)
                    res.json({ success: true, data: createSource })
                }).catch(next)
            }).catch(next)
        }).catch(next)
    }).catch(next)
})

/* Validate card */

router.post('/validate_card', async function (req, res, next) {
    console.log(req.body)
    stripe.tokens.create({
        card: {
            number: req.body.number,
            exp_month: '12',
            exp_year: new Date().getFullYear() + 1,
            cvc: '123'
        }
    }).then((token) => {
        res.json({ success: true, data: token })
    }).catch(next)
})


/* validate coupon */

router.post('/validate_coupan', async function (req, res, next) {
    stripe.coupons.retrieve(req.body.coupon).then((coupon) => {
        res.json({ success: true, data: coupon })
    }).catch(next)
})


module.exports = router;