// routes/api/sale.js

const express = require('express');
const router = express.Router();
const models = require('../../models');
const { getTimeGap, getTimeGapSeconds } = require('../../platform/time');
const BigNumber = require('bignumber.js');
const { model } = require('mongoose');

const Sale = models.sale;
const NFT = models.NFT;
const Subscriber = models.subscriber;
const PaymentConversion = models.payment_conversion;

// @route PUT api/sale
// @description sale prodecure from users
// @access public

router.put('/', async (req, res) => {
    try {
        const {
            collectionAddress,
            tokenId,
            saleId,
            copy,
            method,
            payment,
            paymentName,
            price,
            seller,
            fee,
            royalty,
            duration
        } = req.body;

        const items = await NFT.find({
            collectionAddress: collectionAddress.toLowerCase(),
            tokenId: tokenId
        });

        let nowDate = new Date();

        if (items.length === 0) {
            res.json({ msg: 'no nft item found', result: 0 });
        } else {
            var users = await Subscriber.find({
                address: seller.toLowerCase(),
            });

            if (users.length > 0) {
                let newSale = new Sale({
                    collectionAddress: collectionAddress.toLowerCase(),
                    tokenId: tokenId,
                    saleId: saleId,
                    copy: copy,
                    payment: payment,
                    method: method,
                    paymentName: paymentName,
                    price: price,
                    seller: seller.toLowerCase(),
                    sellerName: users[0].name,
                    fee: fee,
                    royalty: royalty,
                    start: nowDate,
                    duration: duration,
                    when: nowDate,
                });

                await newSale.save();

                let allSales = await Sale.find({
                    collectionAddress: newSale.collectionAddress,
                    tokenId: newSale.tokenId
                });

                let i;
                let totalSum = new BigNumber(0);
                let allCount = 0;
                for (i = 0; i < allSales.length; i++) {
                    let priceConvs = await PaymentConversion.find({ id: allSales[i].payment });
                    if (priceConvs.length === 0)
                        continue;

                    totalSum = totalSum.plus(BigNumber(allSales[i].price).times(BigNumber(priceConvs[0].ratio)).times(BigNumber(allSales[i].copy)));
                    allCount += allSales[i].copy;
                }

                if (allCount > 0) {
                    let avgPrice = totalSum.div(BigNumber(allCount)).toString();
                    items[0].priceUSD = parseFloat(avgPrice);
                    await NFT.findByIdAndUpdate(items[0]._id, items[0]);
                }

                await updateSubscriberPrice(newSale.seller, newSale.price, newSale.payment);

                res.json({ msg: 'Sync to server', result: 1 });
            } else {
                res.json({ msg: 'Unknown user', result: 0 });
            }
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err}`, result: 0 });
    }
});

router.get('/', async (req, res) => {
    try {
        if (req.query.collectionAddress === undefined) {
            let allSales = await Sale.find();
            var tnow = new Date;
            allSales.forEach((part, index, arr) => {
                arr[index]._doc = { ...part._doc, timespan: getTimeGap(tnow, part.when), timesec: getTimeGapSeconds(tnow, part.when) };
            });

            res.json({result: 1, sales: allSales});
        } else {
            const { collectionAddress, tokenId } = req.query;

            var fixed_items = await Sale.find({
                collectionAddress: collectionAddress.toLowerCase(),
                tokenId: parseInt(tokenId),
                method: 0
            });

            var auction_items = await Sale.find({
                collectionAddress: collectionAddress.toLowerCase(),
                tokenId: parseInt(tokenId),
                method: 1
            });

            var tnow = new Date;
            fixed_items.forEach((part, index, arr) => {
                arr[index]._doc = { ...part._doc, timespan: getTimeGap(tnow, part.when), timesec: getTimeGapSeconds(tnow, part.when) };
            });

            auction_items.forEach((part, index, arr) => {
                arr[index]._doc = { ...part._doc, timespan: getTimeGap(tnow, part.when), timesec: getTimeGapSeconds(tnow, part.when) };
            });

            let all = [...fixed_items, ...auction_items];

            res.json({ msg: 'ok', result: 1, sales: all, fixed: fixed_items, auction: auction_items });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}`, result: 0 });
    }
});

router.post('/count', async (req, res) => {
    try {
        const saleReq = req.body;

        let saleItems = await Sale.find({
            collectionAddress: saleReq.collectionAddress.toLowerCase(),
            tokenId: saleReq.tokenId,
            seller: saleReq.seller.toLowerCase(),
        });

        let val = 0;
        if (saleItems.length > 0) {
            let copies = saleItems.map(t => t.copy);
            const reducer = (previousValue, currentValue) => previousValue + currentValue;
            val = copies.reduce(reducer);
        }

        res.json({ msg: 'calculated', result: 1, saleCount: val });
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}`, result: 0 });
    }
});

const updateSubscriberPrice = async (user, price, payment) => {
    let ret = await Subscriber.find({
        address: user.toLowerCase()
    })

    if (ret.length == 0) return;

    let priceConvs = await PaymentConversion.find({ id: payment });
    if (priceConvs.length === 0) return;

    let priceValue = parseFloat(BigNumber(price).times(BigNumber(priceConvs[0].ratio)).toString());

    let item = ret[0];

    if (item.floorPrice === undefined) {
        item.floorPrice = 0.0;
    }

    if (item.ceilPrice === undefined) {
        item.ceilPrice = 0.0;
    }

    if (item.floorPrice == 0.0 || item.floorPrice > priceValue)
        item.floorPrice = priceValue;

    if (item.ceilPrice == 0.0 || item.ceilPrice < priceValue)
        item.ceilPrice = priceValue;

    await Subscriber.findByIdAndUpdate(item._id, item);
}

const removeSale = async (saleId) => {
    let saleFound = await Sale.find({
        saleId: saleId
    });

    if (saleFound.length > 0) {
        await Sale.findByIdAndRemove(saleFound[0]._id);
    }
}

module.exports = router;
module.exports.removeSale = removeSale;
