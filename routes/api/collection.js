// routes/api/collection.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Subscriber = models.subscriber;
const Role = models.role;
const Collection = models.collection;

// @route POST api/collection/new
// @description add a new collection request from users
// @access public

router.post('/new/', (req, res) => {
    let collectionData = req.body;

    collectionData.timestamp = new Date();

    var items = Collection.find({
        contractAddress: collectionData.contractAddress
    });

    if (items.length > 1) {
        res.json({ msg: 'duplicate collections', result: 0 });
    } else if (items.length == 1) {
        let found = items[0];
        if (found.user == '' && found.walletAddress == '') {
            Collection.findByIdAndUpdate(collectionData);
            res.json({ msg: 'updated collection info', result: 1 });
        } else {
            res.json({ msg: 'already exists', result: 0 });
        }
    } else {
        var ret = new Collection(collectionData);
        ret.save();
        res.json({ msg: 'added a new one', result: 1 });
    }
});

router.get('/', async (req, res) => {
    try {
        const { owner, extra, address } = req.query;

        if (owner == undefined) {
            res.json({ msg: 'undefined owner for collection query', result: 0 });
            return;
        } else if (extra === 'all') {
            var items = await Collection.find();
            res.json({ msg: 'ok', result: 1, collections: items });
        } else if (extra === 'onlyOwner') {
            var items = await Collection.find({
                walletAddress: owner
            });
            res.json({ msg: 'ok', result: 1, collections: items });
        } else if (extra === 'one') {
            var items = await Collection.find({
                contractAddress: address,
            });
            res.json({ msg: 'ok', result: 1, collections: items });
        } else {
            res.json({ msg: 'unknown request for collections', result: 0 });
        }
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
        contractAddress: addr
    });

    if (items.length == 0) {
        var ret = await new Collection({
            name: '',
            description: '',
            bannerURI: '',
            logoURI: '',
            contractAddress: addr,
            user: users.length == 1 ? users[0].name : '',
            walletAddress: owner.toLowerCase(),
            timestamp: new Date()
        });
        await ret.save();

        console.log(`raw collection ${addr} added`);
    }
}

module.exports.collection_router = router;
module.exports.addRawCollection = addRawCollection;
