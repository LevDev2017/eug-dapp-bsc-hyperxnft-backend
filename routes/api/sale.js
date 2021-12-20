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
            contract: contract,
            tokenId: tokenId,
            payment: payment,
            price: price,
            days: days,
            hhmm: hhmm,
            name: name,
            address: addr
        } = req.body;

        const items = await NFT.find({
            contract: contract,
            tokenId: tokenId
        });

        if (items.length === 0) {
            res.json({ msg: 'no nft item found'});
        } else if (items[0].onSale !== true) {
            res.json({ msg: 'The nft item is not allowed to be on sale'});
        } else {
            const pi = await Sale.find({
                contract: contract,
                tokenId: tokenId
            });
    
            if (pi.length > 0) {
                res.json({ msg: 'already on sale' });
            } else {
                let newSale = new Sale({
                    contract: contract,
                    tokenId: tokenId,
                    payment: payment,
                    price: price,
                    days: days,
                    hhmm: hhmm,
                    start: new Date(),
                    name: name,
                    address: addr
                });

                await newSale.save();

                res.json({ msg: 'put on sale', res: newSale });
            }
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err}` });
    }
});

module.exports = router;
