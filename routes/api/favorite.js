// routes/api/favorite.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Favorite = models.favorite;

// @route PUT api/favorite
// @description put favorite information request from users
// @access public

router.put('/', async (req, res) => {
    try {
        const {
            contract,
            tokenId,
            name,
            address,
            update
        } = req.body;

        let items = await Favorite.find({
            contract: contract,
            tokenId: tokenId,
            name: name,
            address: address
        })

        if (items.length > 0)
        {
            let i;
            for (i = 0; i < items.length; i ++) {
                await Favorite.findByIdAndRemove(items[i]._id);
            }
        }

        if (update === true) {
            let newItem = new Favorite({
                contract: contract,
                tokenId: tokenId,
                name: name,
                address: address,
                when: new Date()
            });

            await newItem.save();
            res.json({msg: 'added favorite'});
        } else {
            res.json({msg: 'removed favorite'});
        }
    } catch (err) {
        console.log(err);
        res.json({msg: 'fail'});
    }
});

// @route GET api/favorite
// @description GET favorite information request to users
// @access public

router.get('/', async (req, res) => {
    try {
        const { contract, tokenId, account } = req.query;
        var items = await Favorite.find({
            contract: contract,
            tokenId: parseInt(tokenId)
        });

        if (items.length === 0) {
            res.json({ msg: 'no favorites' });
        } else {
            var found = items.find(t => t.address.toLowerCase() === account.toLowerCase());
            res.json({ msg: 'found favorite', count: items.length, set: found !== undefined});
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}` });
    }
});

module.exports = router;