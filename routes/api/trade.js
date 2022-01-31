// routes/api/trade.js

const express = require('express');
const router = express.Router();
const models = require('../../models');
const BigNumber = require('bignumber.js')
const { reload_nft } = require('../../contracts/nft_list');
const { getTimeGap, getTimeGapSeconds } = require('../../platform/time');

const Sale = models.sale;
const Payment = models.payment;
const Subscriber = models.subscriber;
const Trade = models.trade;

// @route PUT api/trade
// @description trade results from users
// @access public

const saleInfo = [
    'creator',
    'seller',
    'sc',
    'tokenId',
    'copy',
    'payment',
    'basePrice',
    'method',
    'startTime',
    'endTime',
    'feeRatio',
    'royaltyRatio'
]

router.post('/', async (req, res) => {
    const tradeReturnValues = req.body;

    var dateWhen = new Date(parseInt(tradeReturnValues.timestamp) * 1000);
    var strNow = dateWhen.toLocaleDateString();

    let saleExt = {};
    let i;
    for (i = 0; i < saleInfo.length; i ++) {
        saleExt[saleInfo[i]] = tradeReturnValues.sale[i];
    }

    let methodString = parseInt(saleExt.method) === 0? 'fixed': 'auction';
    let paymentId = parseInt(saleExt.payment);

    let paymentFound = await Payment.find({ id: paymentId });
    let seller = await Subscriber.find({ address: saleExt.seller.toLowerCase() });
    let winner = await Subscriber.find({ address: tradeReturnValues.winner.toLowerCase() });
    let owner = await Subscriber.find({ address: tradeReturnValues.owner.toLowerCase() });
    let creator = await Subscriber.find({ address: saleExt.creator.toLowerCase() });

    let newItem = {
        collectionAddress: saleExt.sc,
        tokenId: parseInt(saleExt.tokenId),
        saleId: parseInt(tradeReturnValues.saleId),
        copy: parseInt(saleExt.copy),
        method: methodString,
        paymentName: paymentFound.length > 0? paymentFound[0].name: 'unknown',
        basePrice: BigNumber(saleExt.basePrice).div(BigNumber(`1e${paymentFound[0].decimal}`)).toString(),
        seller: saleExt.seller.toLowerCase(),
        sellerName: seller.length > 0? seller[0].name: 'unknown',
        fee: BigNumber(tradeReturnValues.fee).div(BigNumber(`1e${paymentFound[0].decimal}`)).toString(),
        royalty: BigNumber(tradeReturnValues.royalty).div(BigNumber(`1e${paymentFound[0].decimal}`)).toString(),
        winner: tradeReturnValues.winner,
        winnerName: winner.length > 0? winner[0].name: 'unknown',
        payOut: BigNumber(tradeReturnValues.paySeller).div(BigNumber(`1e${paymentFound[0].decimal}`)).toString(),
        creator: saleExt.creator.toLowerCase(),
        creatorName: creator.length > 0? creator[0].name: 'unknown',
        owner: tradeReturnValues.owner,
        ownerName: owner.length > 0? owner[0].name: 'unknown',
        when: dateWhen,
    };

    let newTrade = new Trade(newItem);
    await newTrade.save();

    await reload_nft(newItem.collectionAddress, newItem.tokenId);

    let saleFound = await Sale.find({
        saleId: newItem.saleId
    });

    if (saleFound.length > 0) {
        await Sale.findByIdAndRemove(saleFound[0]._id);
    }

    res.json({msg: 'ok', result: 1});
});

module.exports = router;
