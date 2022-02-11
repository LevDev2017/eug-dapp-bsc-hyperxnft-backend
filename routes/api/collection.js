// routes/api/collection.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Subscriber = models.subscriber;
const Role = models.role;
const Collection = models.collection;
const NFT = models.NFT;

// @route POST api/collection/new
// @description add a new collection request from users
// @access public

router.post('/new/', async (req, res) => {
    let collectionData = req.body;

    collectionData.timestamp = new Date();
    collectionData.contractAddress = collectionData.contractAddress.toLowerCase();
    collectionData.walletAddress = collectionData.walletAddress.toLowerCase();

    var items = await Collection.find({
        contractAddress: collectionData.contractAddress.toLowerCase()
    });

    if (items.length > 1) {
        res.json({ msg: 'duplicate collections', result: 0 });
    } else if (items.length == 1) {
        let found = items[0];
        if (found.user == '' && found.walletAddress == '') {
            await Collection.findByIdAndUpdate(collectionData);
            res.json({ msg: 'updated collection info', result: 1 });
        } else {
            res.json({ msg: 'already exists', result: 0 });
        }
    } else {
        var ret = await new Collection(collectionData);
        await ret.save();
        res.json({ msg: 'added a new one', result: 1 });
    }
});

router.get('/', async (req, res) => {
    try {
        const { owner, extra, address } = req.query;

        let items = [];

        if (owner == undefined) {
            res.json({ msg: 'undefined owner for collection query', result: 0 });
            return;
        } else if (extra === 'all') {
            items = await Collection.find();
        } else if (extra === 'onlyOwner') {
            items = await Collection.find({
                walletAddress: owner.toLowerCase()
            });
        } else if (extra === 'one') {
            items = await Collection.find({
                contractAddress: address.toLowerCase(),
            });
        } else {
            res.json({ msg: 'unknown request for collections', result: 0 });
            return;
        }

        let i;
        for (i = 0; i < items.length; i++) {
            let maxTokenId = await NFT.find({
                collectionAddress: items[i].contractAddress.toLowerCase()
            }).select('tokenId').sort({ tokenId: -1 }).limit(1);

            if (maxTokenId?.length > 0) {
                maxTokenId = maxTokenId[0].tokenId;
            }

            let totalSupply = await NFT.aggregate([
                { $match: { collectionAddress: items[i].contractAddress.toLowerCase() } },
                { $group: { _id: null, sum: { $sum: "$totalSupply" } } }
            ]).limit(1);

            if (totalSupply?.length > 0) {
                totalSupply = totalSupply[0].sum;
            }

            let favoriteCount = await NFT.aggregate([
                { $match: { collectionAddress: items[i].contractAddress.toLowerCase() } },
                { $group: { _id: null, sum: { $sum: "$favoriteCount" } } }
            ]).limit(1);

            if (favoriteCount?.length > 0) {
                favoriteCount = favoriteCount[0].sum;
            }

            let commentCount = await NFT.aggregate([
                { $match: { collectionAddress: items[i].contractAddress.toLowerCase() } },
                { $group: { _id: null, sum: { $sum: "$commentCount" } } }
            ]).limit(1);

            if (commentCount?.length > 0) {
                commentCount = commentCount[0].sum;
            }

            let visitedCount = await NFT.aggregate([
                { $match: { collectionAddress: items[i].contractAddress.toLowerCase() } },
                { $group: { _id: null, sum: { $sum: "$visited" } } }
            ]).limit(1);

            if (visitedCount?.length > 0) {
                visitedCount = visitedCount[0].sum;
            }

            let tradeCount = await NFT.aggregate([
                { $match: { collectionAddress: items[i].contractAddress.toLowerCase() } },
                { $group: { _id: null, sum: { $sum: "$tradeCount" } } }
            ]).limit(1);

            if (tradeCount?.length > 0) {
                tradeCount = tradeCount[0].sum;
            }

            let tradeVolume = await NFT.aggregate([
                { $match: { collectionAddress: items[i].contractAddress.toLowerCase() } },
                { $group: { _id: null, sum: { $sum: "$tradeVolume" } } }
            ]).limit(1);

            if (tradeVolume?.length > 0) {
                tradeVolume = tradeVolume[0].sum;
            }

            items[i]._doc.tokenCount = maxTokenId;
            items[i]._doc.totalSupply = totalSupply;
            items[i]._doc.favoriteCount = favoriteCount;
            items[i]._doc.commentCount = commentCount;
            items[i]._doc.visitedCount = visitedCount;
            items[i]._doc.tradeCount = tradeCount;
            items[i]._doc.tradeVolume = tradeVolume;
        }
        res.json({ msg: 'ok', result: 1, collections: items });
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}`, result: 0 });
    }
});


const addRawCollection = async (addr, owner) => {
    var users = await Subscriber.find({
        address: owner.toLowerCase()
    });

    var items = await Collection.find({
        contractAddress: addr.toLowerCase()
    });

    if (items.length == 0) {
        var ret = await new Collection({
            name: '',
            description: '',
            bannerURI: '',
            logoURI: '',
            contractAddress: addr.toLowerCase(),
            user: users.length == 1 ? users[0].name : '',
            walletAddress: owner.toLowerCase(),
            timestamp: new Date()
        });
        await ret.save();

        console.log(`raw collection ${addr.toLowerCase()} added`);
    }
}

module.exports.collection_router = router;
module.exports.addRawCollection = addRawCollection;
