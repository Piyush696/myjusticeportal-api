const express = require("express");
const router = express.Router();
const request = require("request");
const { User } = require("../models");
const UserMeta = require("../models").UserMeta;
const Lawyer_Facility = require("../models").lawyer_facility;
var passport = require('passport');

// sk_test_zlRA9Hh43Aa6pM80pxdf2mcc00ksE2l4hz
//sk_live_TgvUP4xiCxLmNh4KQx4MxATc00MfApKkpG

var stripe = require("stripe")(
  "sk_test_51HZlF7E0gHnDDynBn1D4La5BtFQKPaNhHTPTjZKFt8tUWgSOISCYGiUzo8zq5Rzshsnvv20P62dA2loctIvjtuKe004GF46zX8"
);

// create customer   **Step-1

router.post("/", async function (req, res, next) {
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
      })
      .catch(next);
  }
});

// plan subscribe

router.post("/subscribe_plan", async function (req, res, next) {
  stripe.plans
    .create({
      amount: req.body.amount,
      currency: req.body.currency,
      interval: req.body.interval,
      product: "prod_IF9YlbHmWQ8ezq",
    })
    .then((plan) => {
      stripe.subscriptions
        .create({
          customer: req.body.customer,
          items: [
            {
              plan: plan.id,
            },
          ],
        })
        .then((subscribePlan) => {
          let userMetaList = [
            {
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
          UserMeta.findAll({ where: {  
            $or: [{ metaKey: 'sub_id', userId: req.body.userId }, { metaKey: 'cust_id',userId: req.body.userId }],  } }).then((data) => {
            if ( data && data.length > 0) {
              let count = 0;
              data.forEach((element, index, Array) => {
                if(element.metaKey === 'sub_id'){
                  UserMeta.update({ metaValue: subscribePlan.id, updatedBy: req.body.userId }, { where: { metaKey: element.metaKey, userId: req.body.userId } }).then((result) => {
                }).catch(next);
                } else  {
                  UserMeta.update({ metaValue: req.body.customer, updatedBy: req.body.userId }, { where: { metaKey: element.metaKey, userId: req.body.userId } }).then((result) => {
                }).catch(next);
                }
                if (count === Array.length - 1) {
                  res.json({ success: true, data: subscribePlan });
              }
              count++
              });
            }
            else {
              UserMeta.bulkCreate(userMetaList).then((result) => {
                if(result){
                  setLawyerFacilityAddons(req.body.facilityList, function (setFacilityLawyer) {
                    if(setFacilityLawyer){
                        res.json({ success: true, data: subscribePlan })
                    }
                  })
                }                
            }).catch(next);
            }
        }).catch(next);
        })
        .catch(next);
    })
    .catch(next);
});



  function setLawyerFacilityAddons (facilityList, callback) {
      Lawyer_Facility.bulkCreate(facilityList).then((result) => {
          callback(result);
      })
  }
/* subcription details */

router.post("/subcription_details", passport.authenticate('jwt', { session: false }), async function (req, res, next) {
  User.findOne(
    {
      include:[
        {
          model:UserMeta,
          where:{metaKey:'sub_id'}
        }
      ],
      where:{userId:req.user.userId}
  }).then((user)=>{
    stripe.subscriptions
    .retrieve(user.userMeta[0].metaValue)
    .then((data) => {
      stripe.customers
        .retrieve(data.customer)
        .then((customer) => {
          stripe.customers
          .retrieveSource(
            customer.id,
           customer.default_source
          ).then((card)=>{
            let x = []
             y = {
               "lastFourDigit":card.last4,
               "amount":data.plan.amount,
               "status":data.status,
               "created":data.plan.created
             }
             x.push(y)
          res.json({ success: true, data: x });
          }).catch((next)=>{
            console.log(next)
          })
        }).catch((next)=>{
          console.log(next)
        })
    }).catch((next)=>{
      console.log(next)
    })
  })
});

/* update card */

router.post("/update_card", async function (req, res, next) {
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
});

/* Validate card */

router.post("/validate_card", async function (req, res, next) {
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
});

/* validate coupon */

router.post("/validate_coupan", async function (req, res, next) {
  stripe.coupons
    .retrieve(req.body.coupon)
    .then((coupon) => {
      res.json({ success: true, data: coupon });
    })
    .catch(next);
});



module.exports = router;
