// routes/api/offer.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

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

        res.json({ msg: 'Sync to server', result: 1 });
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}` , result: 0});
    }
});

router.get('/', async (req, res) => {
    try {
        if (req.query.collectionAddress !== undefined) {
            let tt = await Offer.find({
                collectionAddress: req.query.collectionAddress.toLowerCase(),
                tokenId: parseInt(req.query.tokenId)
            })

            res.json({msg: 'found', result: 1, offers: tt});
        }
    } catch (err) {
        console.log(`${err.message}`);
        res.json({msg: err.message, result: 0});
    }
})

module.exports = router;
