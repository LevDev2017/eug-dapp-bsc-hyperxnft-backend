// routes/api/offer.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Offer = models.offer;
const NFT = models.NFT;

// @route PUT api/offer
// @description offer prodecure from users
// @access public

router.put('/', async (req, res) => {
    try {
        const {
            contract: contract,
            tokenId: tokenId,
            quantity: quantity,
            payment: payment,
            price: price,
            days: days,
            hhmm: hhmm,
            name: name,
            address: addr
        } = req.body;

        const items = await NFT.find({
            contract: contract.toLowerCase(),
            tokenId: tokenId
        });

        if (items.length === 0) {
            res.json({ msg: 'no nft item found' });
        } else if (items[0].onSale !== true) {
            res.json({ msg: 'The nft item is not allowed to be on sale' });
        } else {
            let newOffer = new Offer({
                contract: contract.toLowerCase(),
                tokenId: tokenId,
                quantity: quantity,
                payment: payment,
                price: price,
                days: days,
                hhmm: hhmm,
                start: new Date(),
                name: name,
                address: addr.toLowerCase()
            });

            await newOffer.save();

            res.json({ msg: 'put on offer', res: newOffer });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err}` });
    }
});

module.exports = router;
