// routes/api/creator.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Creator = models.creator;
const Subscriber = models.subscriber;
const Payment = models.payment;
const PaymentConversion = models.payment_conversion;

// @route PUT api/creator
// @description creator information request from users
// @access public

router.get('/', async (req, res) => {
    try {
        if (req.query.info === 'all') {
            let items = await Creator.find();
            let i;
            for (i = 0; i < items.length; i++) {
                let subscriberInfo = await Subscriber.find({
                    name: items[i].name,
                    email: items[i].email,
                    password: items[i].password,
                    address: items[i].address,
                })

                if (subscriberInfo.length > 0) {
                    items[i] = {
                        ...items[i]._doc,
                        avatarURI: subscriberInfo[0].avatarURI,
                        coverURI: subscriberInfo[0].coverURI,
                        businessName: subscriberInfo[0].businessName,
                        bio: subscriberInfo[0].bio,
                        notification: subscriberInfo[0].notification,
                        floorPrice: subscriberInfo[0].floorPrice,
                        ceilPrice: subscriberInfo[0].ceilPrice,
                        volumeTrade: subscriberInfo[0].volumeTrade,
                        holders: subscriberInfo[0].holders,
                        items: subscriberInfo[0].items,
                        favoriteCount: subscriberInfo[0].favoriteCount,
                        commentCount: subscriberInfo[0].commentCount
                    };
                }
            }

            res.json({ result: 1, creators: items });
        } else if(req.query.info === 'payment') {
            let users = await Creator.find({ address: req.query.address.toLowerCase() });
            if (users.length > 0) {
                let paymentIds;
                if (users[0].payment !== undefined) {
                    paymentIds = JSON.parse(users[0].payment);
                } else {
                    paymentIds = [0, 1, 2];
                }
                
                let payments = await Payment.find();
                let payment_conversions = await PaymentConversion.find();

                let i;
                let retPayments = [];
                for (i = 0; i < paymentIds.length; i ++) {
                    let py = payments.find(tt => tt.id === paymentIds[i]);
                    let pyc = payment_conversions.find(tt => tt.id === paymentIds[i]);

                    retPayments.push({
                        ...pyc._doc,
                        ...py._doc,
                    })
                }

                res.json({result: 1, payments: retPayments});
            } else {
                res.json({ result: 0});
            }
        } else {
            res.json({ result: 0, msg: 'not implemented' });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

module.exports = router;
