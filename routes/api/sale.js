// routes/api/sale.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Sale = models.sale;
const NFT = models.NFT;

// @route PUT api/sale
// @description sale prodecure from users
// @access public

router.put('/', async (req, res) => {
    try {
        const {
            collectionAddress,
            tokenId,
            payment,
            paymentName,
            price,
            seller,
            fee,
            royalty,
            duration,
            address
        } = req.body;

        const items = await NFT.find({
            collectionAddress: collectionAddress,
            tokenId: tokenId
        });

        let nowDate = new Date();

        if (items.length === 0) {
            res.json({ msg: 'no nft item found', result: 0});
        } else {
            let newSale = new Sale({
                collectionAddress: collectionAddress,
                tokenId: tokenId,
                payment: payment,
                paymentName: paymentName,
                price: price,
                seller: seller,
                fee: fee,
                royalty: royalty,
                start: nowDate,
                duration: duration,
                address: address,
                when: nowDate,
            });

            await newSale.save();

            res.json({ msg: 'Sync to server', result: 1 });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err}`, result: 0 });
    }
});

module.exports = router;
