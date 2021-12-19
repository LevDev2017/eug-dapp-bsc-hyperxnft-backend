// routes/api/nft.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const NFT = models.NFT;

// @route POST api/nft
// @description nft prodecure from users
// @access public


router.get('/', async (req, res) => {
    try {
        if (JSON.stringify(req.query) === '{}') {
            var items = await NFT.find();
            if (items !== undefined && items.length > 0) {
                res.json({ msg: 'found', nft: items });
            } else {
                res.json({ msg: 'not found' });
            }
        } else {
            var filter_text = "";
            if (req.query.text !== undefined) {
                filter_text = req.query.text;
            }

            var owner = "";
            if (req.query.owner !== undefined) {
                owner = req.query.owner;
            }

            var items = [];
            if (owner !== "") {
                items = await NFT.find(
                    {
                        $and: [
                            {
                                $or: [
                                    { collectionName: { $regex: filter_text, $options: "i" } },
                                    { symbol: { $regex: filter_text, $options: "i" } },
                                    { contract: filter_text },
                                    { URI: filter_text },
                                    { name: { $regex: filter_text, $options: "i" } },
                                    { title: { $regex: filter_text, $options: "i" } },
                                    { category: { $regex: filter_text, $options: "i" } },
                                    { description: { $regex: filter_text, $options: "i" } },
                                    { hashtags: { $regex: filter_text, $options: "i" } }
                                ]
                            },
                            {
                                $or: [
                                    { owner: { $regex: owner, $options: "i" } }
                                ]
                            },
                        ]
                    }
                );
            } else {
                items = await NFT.find(
                    {
                        $and: [
                            {
                                $or: [
                                    { collectionName: { $regex: filter_text, $options: "i" } },
                                    { symbol: { $regex: filter_text, $options: "i" } },
                                    { contract: filter_text },
                                    { URI: filter_text },
                                    { owner: filter_text },
                                    { name: { $regex: filter_text, $options: "i" } },
                                    { title: { $regex: filter_text, $options: "i" } },
                                    { category: { $regex: filter_text, $options: "i" } },
                                    { description: { $regex: filter_text, $options: "i" } },
                                    { hashtags: { $regex: filter_text, $options: "i" } }
                                ]
                            }
                        ]
                    }
                );
            }

            res.json({ msg: 'found', nft: items });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err}` });
    }
});

router.get('/:address/:id', async (req, res) => {
    try {
        var items = await NFT.find({
            contract: req.params.address,
            tokenId: parseInt(req.params.id)
        });
        if (items.length > 0) {
            res.json({ msg: 'found', item: items[0] });
        } else {
            res.json({ msg: 'not found' });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err}` });
    }
});

module.exports = router;
