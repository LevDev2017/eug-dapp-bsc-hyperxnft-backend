// routes/api/payment.js

const express = require('express');
const router = express.Router();
const models = require('../../models');
const { registerPaymentToken } = require('../../contracts/nft_list')

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


const paymentBind = async () => {
    let errString = '';

    const paymentBindInner = async () => {
        try {
            let pys = await Payment.find();
            let i;
            for (i = 0; i < pys.length; i ++) {
                await registerPaymentToken(pys[i].id, pys[i].contract);
            }
            errString = '';
        } catch (err) {
            let errText = err.toString();
            if (errString != errText) {
                errString = errText;
                console.log("paymentBindInner: ", errText);
            }
        }
    }

    const recursive_run = () => {
        paymentBindInner()
            .then(() => {
                setTimeout(recursive_run, 1000);
            })
            .catch(err => {
                setTimeout(recursive_run, 1000);
            });
    }

    recursive_run();
}

module.exports = router;
module.exports.paymentBind = paymentBind;
