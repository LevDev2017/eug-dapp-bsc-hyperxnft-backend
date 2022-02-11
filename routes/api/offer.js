// routes/api/offer.js

const express = require('express');
const router = express.Router();
const models = require('../../models');
const { putNotification } = require('./notification')
const { getNewFactoryContract, getMsgSenderFormat } = require('../../contracts/nft_list');

const Offer = models.offer;

// @route PUT api/offer
// @description offer prodecure from users
// @access public

router.put('/', async (req, res) => {
    try {
        let newOffer = {
            saleId: req.body.saleId,
            collectionAddress: req.body.collectionAddress,
            tokenId: req.body.tokenId,
            seller: req.body.seller.toLowerCase(),
            sellerName: req.body.sellerName,
            copy: req.body.copy,
            price: req.body.price,
            priceUSD: req.body.priceUSD,
            payment: req.body.payment,
            paymentName: req.body.paymentName,
            start: new Date(),
            duration: req.body.duration,
            address: req.body.address.toLowerCase(),
            name: req.body.name
        }

        let ret = await new Offer(newOffer);
        await ret.save();

        await putNotification(newOffer.address, newOffer.seller, ` removed his/her favorite from your NFT`)

        res.json({ msg: 'Sync to server', result: 1 });
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

router.post('/remove', async (req, res) => {
    try {
        const removeReq = req.body;
        if (removeReq.saleId !== undefined) {
            await removeOffer(removeReq.saleId);
            res.json({ msg: 'removed a sale', result: 1 });
        } else {
            res.json({ msg: 'unknown remove', result: 0 });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}`, result: 0 });
    }
});

router.get('/', async (req, res) => {
    try {
        if (req.query.collectionAddress !== undefined) {
            let tt = await Offer.find({
                collectionAddress: req.query.collectionAddress.toLowerCase(),
                tokenId: parseInt(req.query.tokenId)
            })

            res.json({ msg: 'found', result: 1, offers: tt });
        } else if (req.query.owner !== undefined) {
            let tt = await Offer.find({
                seller: req.query.owner.toLowerCase()
            })

            res.json({ msg: 'found', result: 1, offers: tt });
        }
    } catch (err) {
        console.log(`${err.message}`);
        res.json({ msg: err.message, result: 0 });
    }
})

const poll_offer = async () => {
    let errString = '';

    const poll_offer_inner = async () => {
        try {
            let contract = await getNewFactoryContract();
            let msgSenderInfo = getMsgSenderFormat();

            if (msgSenderInfo === undefined)
                return;

            let saleCount = parseInt(await contract.methods.saleCount().call(msgSenderInfo));
            let i;
            let offerSales = [];
            for (i = 0; i < saleCount; i += 100) {
                let cc = saleCount - i;
                if (cc > 100) {
                    cc = 100;
                }

                let tt = await contract.methods.getSaleInfo(i, cc).call(msgSenderInfo);
                offerSales = [...offerSales, ...tt.filter(t => parseInt(t.method) === 2)];
            }

            let nowTime = new Date().getTime() / 1000;
            let aa = offerSales.map(t => parseInt(t.endTime) - nowTime);
            // console.log('--------------', aa);

            for (i = 0; i < offerSales.length; i++) {
                if (parseInt(offerSales[i].endTime) < nowTime) {
                    // console.log('>>>>>>>>>>>>>', bidSales[i]);
                    try {
                        let tx = await contract.methods.removeOffer(parseInt(offerSales[i].saleId)).send(msgSenderInfo);
                        if (tx !== undefined) {
                            console.log('----------- remove offer ...', tx);
                            tx.events.RemoveFromSale?.returnValues && await removeOffer(parseInt(tx.events.RemoveFromSale?.returnValues.saleId));
                        }
                    } catch (err) {
                        let errText = err.toString();
                        if (errString != errText) {
                            errString = errText;
                            console.log("remove_offer: ", errText);
                        }
                    }
                }
            }

            errString = '';
        } catch (err) {
            let errText = err.toString();
            if (errString != errText) {
                errString = errText;
                console.log("poll_offer: ", errText);
            }
        }
    }

    const recursive_run = () => {
        poll_offer_inner()
            .then(() => {
                setTimeout(recursive_run, 1000);
            })
            .catch(err => {
                setTimeout(recursive_run, 1000);
            });
    }

    recursive_run();
}


const removeOffer = async (saleId) => {
    await Offer.deleteMany({saleId: saleId});
}

module.exports = router;
module.exports.poll_offer = poll_offer;
module.exports.removeOffer = removeOffer;
