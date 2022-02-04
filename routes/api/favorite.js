// routes/api/favorite.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Favorite = models.favorite;
const NFT = models.NFT;
const Subscriber = models.subscriber;

// @route PUT api/favorite
// @description put favorite information request from users
// @access public

router.put('/', async (req, res) => {
    try {
        const {
            tokenId,
            name,
            update
        } = req.body;
        const contract = req.body.contract.toLowerCase();
        const address = req.body.address.toLowerCase();

        let items = await Favorite.find({
            collectionAddress: contract,
            tokenId: tokenId,
            name: name,
            address: address
        })

        if (items.length > 0) {
            let i;
            for (i = 0; i < items.length; i++) {
                await Favorite.findByIdAndRemove(items[i]._id);
            }
        }

        if (update === true) {
            let newItem = new Favorite({
                collectionAddress: contract,
                tokenId: tokenId,
                name: name,
                address: address,
                when: new Date()
            });

            await newItem.save();

            let cnt = await Favorite.find({ collectionAddress: newItem.collectionAddress, tokenId: newItem.tokenId }).countDocuments();
            let nftItems = await NFT.find({ collectionAddress: newItem.collectionAddress, tokenId: newItem.tokenId });
            if (nftItems.length > 0) {
                nftItems[0].favoriteCount = cnt;
                await NFT.findByIdAndUpdate(nftItems[0]._id, nftItems[0]);
            }

            let users = await Subscriber.find({ address: address });
            if (users.length > 0) {
                let user = users[0];
                if (user.favoriteCount === undefined) user.favoriteCount = 0;
                user.favoriteCount++;
                await Subscriber.findByIdAndUpdate(user._id, user);
            }

            res.json({ msg: 'added favorite', result: 1 });
        } else {
            let cnt = await Favorite.find({ collectionAddress: contract, tokenId: tokenId }).countDocuments();
            let nftItems = await NFT.find({ collectionAddress: contract, tokenId: tokenId });
            if (nftItems.length > 0) {
                nftItems[0].favoriteCount = cnt;
                await NFT.findByIdAndUpdate(nftItems[0]._id, nftItems[0]);
            }

            let users = await Subscriber.find({ address: address });
            if (users.length > 0) {
                let user = users[0];
                if (user.favoriteCount === undefined) user.favoriteCount = 0;
                user.favoriteCount--;
                await Subscriber.findByIdAndUpdate(user._id, user);
            }

            res.json({ msg: 'removed favorite', result: 1 });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: 'fail', result: 0 });
    }
});

// @route GET api/favorite
// @description GET favorite information request to users
// @access public

router.get('/', async (req, res) => {
    try {
        const { collectionAddress, tokenId, account } = req.query;
        var items = await Favorite.find({
            collectionAddress: collectionAddress.toLowerCase(),
            tokenId: parseInt(tokenId)
        });

        if (items.length === 0) {
            res.json({ msg: 'no favorites' });
        } else {
            var found = items.find(t => t.address.toLowerCase() === account.toLowerCase());
            res.json({ msg: 'found favorite', count: items.length, set: found !== undefined });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}` });
    }
});


// @route GET api/favorite/count
// @description GET favorite count to users
// @access public

router.get('/count', async (req, res) => {
    try {
        const { contract, tokenId } = req.query;
        let count = await Favorite.find({
            collectionAddress: contract.toLowerCase(),
            tokenId: parseInt(tokenId)
        }).countDocuments();

        res.json({ msg: 'favorite count', result: 1, count: count });
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}`, result: 0 });
    }
});

router.get('/owner', async (req, res) => {
    try {
        let address = req.query.address.toLowerCase();

        let items = await Favorite.find({
            address: address
        });

        let i;
        let vv = [];
        for (i = 0; i < items.length; i ++) {
            let nftItems = await NFT.find({
                collectionAddress: items[i].collectionAddress.toLowerCase(),
                tokenId: items[i].tokenId
            });

            if (nftItems.length > 0)
                vv.push(nftItems[0]);
        }

        res.json({ msg: 'favorite count', result: 1, items: vv });
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}`, result: 0 });
    }
});

module.exports = router;
