// routes/api/payment.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Payment = models.payment;
const PaymentConversion = models.payment_conversion;

// @route POST api/payment
// @description get payment information request from users
// @access public

router.get('/', async (req, res) => {
    try {
        var ret = await Payment.find();
        res.json({ msg: 'ok', payment: ret });
        // console.log("payment: ============== ", ret);
    } catch (err) {
        console.log(err);
        res.json({ msg: 'error' });
    }
});

router.get('/conversion', async (req, res) => {
    try {
        var ret = await PaymentConversion.find();
        res.json({ msg: 'ok', conversion: ret });
        // console.log("payment-conversion: ============== ", ret);
    } catch (err) {
        console.log(err);
        res.json({ msg: 'error' });
    }
});

module.exports = router;
