// routes/api/bid.js

const express = require('express');
const router = express.Router();
const models = require('../../models');
const { putNotification } = require('./notification')
const BigNumber = require('bignumber.js')

const Sale = models.sale;
const Payment = models.payment;
const Subscriber = models.subscriber;
const Bid = models.bid;
const Owner = models.owner;
const PaymentConversion = models.payment_conversion;
const NFT = models.NFT;


// @route PUT api/bid
// @description bid results from users
// @access public

router.post('/', async (req, res) => {
    try {
        const bidInfo = req.body;

        var dateWhen = new Date();
        var strNow = dateWhen.toLocaleDateString();

        let newItem = {
            collectionAddress: bidInfo.collectionAddress.toLowerCase(),
            tokenId: bidInfo.tokenId,
            saleId: bidInfo.saleId,
            copy: bidInfo.copy,
            payment: bidInfo.payment,
            paymentName: bidInfo.paymentName,
            bidPrice: bidInfo.bidPrice,
            priceUSD: bidInfo.priceUSD,
            seller: bidInfo.seller.toLowerCase(),
            sellerName: bidInfo.sellerName,
            bidder: bidInfo.bidder.toLowerCase(),
            bidderName: bidInfo.bidderName,
            when: dateWhen
        }

        let ret = await new Bid(newItem);
        await ret.save();

        await putNotification(newItem.bidder, newItem.seller, ` placed a bid on your sale`)

        res.json({ msg: 'Sync to server', result: 1 });
    } catch (err) {
        console.log(`${err.message}`);
        res.json({ msg: `${err.message}`, result: 0 });
    }
});

router.get('/', async (req, res) => {
    try {
        if (req.query.saleId !== undefined) {
            let saleId = parseInt(req.query.saleId);
            let items = await Bid.find({
                saleId: saleId
            });

            res.json({ result: 1, bids: items});
        } else if (req.query.user === undefined) {
            let collectionAddress = req.query.collectionAddress.toLowerCase();
            let tokenId = parseInt(req.query.tokenId);
            let period = parseInt(req.query.period);

            res.json({ msg: 'found', result: 1 });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

const removeBids = async (saleId) => {
    await Bid.deleteMany({
        saleId: saleId
    });
}

module.exports = router;
module.exports.removeBids = removeBids;
