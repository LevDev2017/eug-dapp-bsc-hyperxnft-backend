// routes/api/trade.js

const express = require('express');
const router = express.Router();
const models = require('../../models');
const BigNumber = require('bignumber.js')
const { getTimeGap, getTimeGapSeconds } = require('../../platform/time');
const { updateOwnerInfo, updateHoldersItemsInfo, updateVolumeTrade } = require('./nft');
const { getNewFactoryContract, getMsgSenderFormat } = require('../../contracts/nft_list');
const { removeBids } = require('./bid');
const { removeSale } = require('./sale');

const Sale = models.sale;
const Payment = models.payment;
const Subscriber = models.subscriber;
const Trade = models.trade;
const Owner = models.owner;
const PaymentConversion = models.payment_conversion;
const NFT = models.NFT;

// @route PUT api/trade
// @description trade results from users
// @access public

router.post('/', async (req, res) => {
    try {
        const tradeReturnValues = req.body;

        await tradeResult(tradeReturnValues);

        res.json({ msg: 'ok', result: 1 });
    } catch (err) {
        console.log(`${err.message}`);
        res.json({ msg: `${err.message}`, result: 0 });
    }
});

router.get('/', async (req, res) => {
    try {
        if (req.query.user === undefined) {
            let collectionAddress = req.query.collectionAddress.toLowerCase();
            let tokenId = parseInt(req.query.tokenId);
            let period = parseInt(req.query.period);

            let curTime = new Date();
            let curTimeStamp = curTime.getTime();
            let startTimeStamp = curTimeStamp - period * 1000;
            let startTime = new Date(startTimeStamp);

            let minTime;

            let r;
            if (period !== 0) {
                r = await Trade.find({
                    collectionAddress: collectionAddress,
                    tokenId: tokenId,
                    when: {
                        $gte: startTime,
                        $lte: curTime
                    }
                }).select('_id when priceUSD');

                minTime = startTime;
                if (r.length > 0) {
                    if (minTime.getTime() < r[0].when.getTime())
                        minTime = r[0].when;
                }
            } else {
                r = await Trade.find({
                    collectionAddress: collectionAddress,
                    tokenId: tokenId
                }).select('_id when priceUSD');

                if (r.length > 0) {
                    minTime = r[0].when;
                } else {
                    minTime = curTime;
                }
            }

            res.json({ msg: 'found', result: 1, prices: r, min: minTime.getTime() });
        } else {
            let userAddress = req.query.user.toLowerCase();
            let period = parseInt(req.query.period);

            let curTime = new Date();
            let curTimeStamp = curTime.getTime();
            let startTimeStamp = curTimeStamp - period * 1000;
            let startTime = new Date(startTimeStamp);

            let minTime;

            let r;
            if (period !== 0) {
                r = await Trade.find({
                    $or: [
                        { seller: userAddress },
                        { winner: userAddress },
                        { creator: userAddress }
                    ],
                    when: {
                        $gte: startTime,
                        $lte: curTime
                    }
                }).select('_id method collectionAddress tokenId basePrice paymentName priceUSD copy seller winner when');

                minTime = startTime;
                if (r.length > 0) {
                    if (minTime.getTime() < r[0].when.getTime())
                        minTime = r[0].when;
                }
            } else {
                r = await Trade.find({
                    $or: [
                        { seller: userAddress },
                        { winner: userAddress },
                        { creator: userAddress }
                    ]
                }).select('_id method collectionAddress tokenId basePrice paymentName priceUSD copy seller winner when');

                if (r.length > 0) {
                    minTime = r[0].when;
                } else {
                    minTime = curTime;
                }
            }

            let tt = r.map(t => {
                let c = JSON.parse(JSON.stringify(t));
                c.timeAgo = getTimeGap(curTime, t.when);
                c.cindex = t.tokenId.toString() + t.collectionAddress;
                c.name = '';
                return c;
            })

            let i;
            for (i = 0; i < tt.length; i++) {
                if (tt[i].name === '') {
                    let found = await NFT.find({
                        collectionAddress: tt[i].collectionAddress,
                        tokenId: tt[i].tokenId
                    })

                    let tname = 'unknown';
                    if (found.length > 0) {
                        tname = found[0].title;
                    }

                    let j;
                    for (j = i; j < tt.length; j++) {
                        if (tt[j].collectionAddress === tt[i].collectionAddress && tt[j].tokenId === tt[i].tokenId) {
                            tt[j].name = tname;
                        }
                    }
                }
            }

            res.json({ result: 1, history: tt, min: minTime.getTime() });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err}`, result: 0 });
    }
});

const tradeResult = async (tradeReturnValues) => {
    var dateWhen = new Date(parseInt(tradeReturnValues.timestamp) * 1000);
    var strNow = dateWhen.toLocaleDateString();

    console.log('--------------------', tradeReturnValues);

    let methodString = parseInt(tradeReturnValues.sale.method) === 0 ? 'buy' : parseInt(tradeReturnValues.sale.method) === 1 ? 'bid' : parseInt(tradeReturnValues.sale.method) === 2 ? 'offer' : 'unknown';
    let paymentId = parseInt(tradeReturnValues.sale.payment);

    let paymentFound = await Payment.find({ id: paymentId });
    let seller = await Subscriber.find({ address: tradeReturnValues.sale.seller.toLowerCase() });
    let winner = await Subscriber.find({ address: tradeReturnValues.winner.toLowerCase() });
    let owner = await Subscriber.find({ address: tradeReturnValues.owner.toLowerCase() });
    let creator = await Subscriber.find({ address: tradeReturnValues.sale.creator.toLowerCase() });

    let paymentConv = await PaymentConversion.find({ id: paymentId });
    let priceUSD = 0.0;
    let basePayPrice = BigNumber(tradeReturnValues.paySeller).plus(BigNumber(tradeReturnValues.royalty)).plus(BigNumber(tradeReturnValues.devFee)).div(BigNumber(tradeReturnValues.sale.copy)).div(BigNumber(`1e${paymentFound[0].decimal}`));
    if (paymentConv.length > 0 && paymentFound.length > 0) {
        priceUSD = parseFloat(basePayPrice.times(BigNumber(paymentConv[0].ratio)).toString());
    }

    let newItem = {
        collectionAddress: tradeReturnValues.sale.sc.toLowerCase(),
        tokenId: parseInt(tradeReturnValues.sale.tokenId),
        saleId: parseInt(tradeReturnValues.saleId),
        copy: parseInt(tradeReturnValues.sale.copy),
        method: methodString,
        payment: paymentId,
        paymentName: paymentFound.length > 0 ? paymentFound[0].name : 'unknown',
        basePrice: basePayPrice.toString(),
        priceUSD: priceUSD,
        seller: tradeReturnValues.sale.seller.toLowerCase(),
        sellerName: seller.length > 0 ? seller[0].name : 'unknown',
        fee: BigNumber(tradeReturnValues.fee).div(BigNumber(`1e${paymentFound[0].decimal}`)).toString(),
        royalty: BigNumber(tradeReturnValues.royalty).div(BigNumber(`1e${paymentFound[0].decimal}`)).toString(),
        winner: tradeReturnValues.winner.toLowerCase(),
        winnerName: winner.length > 0 ? winner[0].name : 'unknown',
        payOut: BigNumber(tradeReturnValues.paySeller).div(BigNumber(`1e${paymentFound[0].decimal}`)).toString(),
        creator: tradeReturnValues.sale.creator.toLowerCase(),
        creatorName: creator.length > 0 ? creator[0].name : 'unknown',
        owner: tradeReturnValues.owner.toLowerCase(),
        ownerName: owner.length > 0 ? owner[0].name : 'unknown',
        when: dateWhen,
    };

    let newTrade = new Trade(newItem);
    await newTrade.save();

    await removeSale(newItem.saleId);

    // console.log('------------------- ', updateOwnerInfo);
    await updateOwnerInfo(newItem.collectionAddress, newItem.tokenId, newItem.winner);
    await updateOwnerInfo(newItem.collectionAddress, newItem.tokenId, newItem.seller);

    await updateHoldersItemsInfo(newItem.collectionAddress, newItem.tokenId, newItem.seller, newItem.winner, newItem.copy);
    await updateVolumeTrade(newItem.seller, newItem.copy, priceUSD);
}


const poll_bid = async () => {
    let errString = '';

    const poll_bid_items = async () => {
        try {
            let contract = await getNewFactoryContract();
            let msgSenderInfo = await getMsgSenderFormat();

            let saleCount = parseInt(await contract.methods.saleCount().call(msgSenderInfo));
            let i;
            let bidSales = [];
            for (i = 0; i < saleCount; i += 100) {
                let cc = saleCount - i;
                if (cc > 100) {
                    cc = 100;
                }

                let tt = await contract.methods.getSaleInfo(i, cc).call(msgSenderInfo);
                bidSales = [...bidSales, ...tt.filter(t => parseInt(t.method) === 1)];
            }

            let nowTime = new Date().getTime() / 1000;
            let aa = bidSales.map(t => parseInt(t.endTime) - nowTime);
            console.log('--------------', aa);

            for (i = 0; i < bidSales.length; i ++) {
                if (parseInt(bidSales[i].endTime) < nowTime) {
                    // console.log('>>>>>>>>>>>>>', bidSales[i]);
                    let tx = await contract.methods.finalizeAuction(parseInt(bidSales[i].saleId)).send(msgSenderInfo);
                    if (tx !== undefined) {
                        // tx.events.AuctionResult?.returnValues && console.log('---------------- AuctionResult', tx.events.AuctionResult.returnValues);
                        // tx.events.TransferNFTs?.returnValues && console.log('---------------- TransferNFTs', tx.events.TransferNFTs.returnValues);
                        // tx.events.Trade?.returnValues && console.log('---------------- Trade', tx.events.Trade.returnValues);
                        // tx.events.RemoveFromSale?.returnValues && console.log('---------------- Trade', tx.events.RemoveFromSale.returnValues);

                        tx.events.Trade?.returnValues && await tradeResult(tx.events.Trade?.returnValues);
                        tx.events.RemoveFromSale?.returnValues && await removeSale(parseInt(tx.events.RemoveFromSale?.returnValues.saleId));
                        tx.events.AuctionResult?.returnValues && await removeBids(parseInt(tx.events.AuctionResult?.returnValues.saleId));
                    }
                }
            }

            errString = '';
        } catch (err) {
            let errText = err.toString();
            if (errString != errText) {
                errString = errText;
                console.log("poll_bid: ", errText);
            }
        }
    }

    const recursive_run = () => {
        poll_bid_items()
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
module.exports.poll_bid = poll_bid;
