// routes/api/nft.js

const express = require('express');
const router = express.Router();
const models = require('../../models');
const { delay } = require('../../platform/wait');
const { getBalance, getCreator, getHolderCount } = require('../../contracts/nft_list');

const NFT = models.NFT;
const Owner = models.owner;
const Trade = models.trade;
const Subscriber = models.subscriber;
const Role = models.role;

// @route POST api/nft
// @description nft prodecure from users
// @access public


router.get('/', async (req, res) => {
    try {
        if (JSON.stringify(req.query) === '{}') {
            var items = await NFT.find();
            if (items !== undefined) {
                res.json({ msg: 'found', result: items.length, nft: items });
            } else {
                res.json({ msg: 'not found', result: 0, nft: [] });
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
                                    { collectionAddress: filter_text },
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
                                    { collectionAddress: filter_text },
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
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

router.get('/:address/:id', async (req, res) => {
    try {
        var items = await NFT.find({
            collectionAddress: req.params.address.toLowerCase(),
            tokenId: parseInt(req.params.id)
        });
        if (items.length > 0) {
            res.json({ msg: 'found', item: items[0] });
        } else {
            res.json({ msg: 'not found' });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

router.get('/owner', async (req, res) => {
    try {
        let items = [];
        if (req.query.validBalance !== undefined) {
            items = await Owner.find({
                owner: req.query.address.toLowerCase(),
                balance: { $gt: 0 },
            })
        } else if (req.query.collectionAddress !== undefined) {
            items = await Owner.find({
                collectionAddress: req.query.collectionAddress.toLowerCase(),
                tokenId: parseInt(req.query.tokenId)
            })
        } else {
            items = await Owner.find({
                owner: req.query.address.toLowerCase()
            })
        }

        let i;
        let retArray = [];

        for (i = 0; i < items.length; i ++) {
            let subscribers = await Subscriber.find({
                address: items[i].owner.toLowerCase()
            })

            if (subscribers.length > 0) {
                retArray.push({
                    ...items[i]._doc,
                    ...subscribers[0]._doc
                })
            }
        }
        if (items.length > 0) {
            res.json({ msg: 'found', result: 1, items: retArray });
        } else {
            res.json({ msg: 'not found', result: 0 });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

router.get('/property', async (req, res) => {
    try {
        const { type, name, creator } = req.query;

        let nfts = await NFT.find();

        const filterProp = (tt) => {
            let props = JSON.parse(tt.attributes);
            let pp = props.find(p => p.type === type && p.name === name);
            return pp !== undefined;
        }

        let nftsWithProps = nfts.filter(filterProp)
        let nftsByCreator = nfts.filter(tt => tt.creator.toLowerCase() === creator.toLowerCase());
        let nftsWithPropsByCreator = nftsByCreator.filter(filterProp);

        let p1 = nfts.length > 0? nftsWithProps.length * 100.0 / nfts.length: 100.0;
        let p2 = nftsByCreator.length > 0? nftsWithPropsByCreator.length * 100.0 / nftsByCreator.length: 100.0;

        res.json({result: 1, percentage: {marketplace: p1, creator: p2} });
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

router.post('/lump', async (req, res) => {
    try {
        let arr = req.body;
        let ret = [];

        let i;
        for (i = 0; i < arr.length; i++) {
            let items = await NFT.find({
                collectionAddress: arr[i].collectionAddress.toLowerCase(),
                tokenId: arr[i].tokenId,
            })

            if (items.length > 0)
                ret.push(items[0]);
        }

        if (ret.length > 0) {
            res.json({ msg: 'found', result: 1, items: ret });
        } else {
            res.json({ msg: 'not found', result: 0, items: [] });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

router.post('/reload', async (req, res) => {
    // const { collectionAddress, tokenId } = req.body;
    // await reload_nft(collectionAddress.toLowerCase(), tokenId);
    res.json({ result: 1 });
});

router.post('/visit', async (req, res) => {
    const { collectionAddress, tokenId } = req.body;

    let nfts = await NFT.find({
        collectionAddress: collectionAddress.toLowerCase(),
        tokenId: parseInt(tokenId)
    })

    if (nfts.length > 0) {
        let nft = nfts[0];
        if (nft.visited === undefined) nft.visited = 1;
        else nft.visited ++;

        await NFT.findByIdAndUpdate(nft._id, nft);
    }
    res.json({ result: 1 });
});

router.put('/new', async (req, res) => {
    try {
        let user = await Subscriber.find({
            address: req.body.creator.toLowerCase(),
        })
        let newItem = {
            collectionAddress: req.body.collectionAddress.toLowerCase(),
            tokenId: req.body.tokenId,
            URI: req.body.URI,
            totalSupply: req.body.totalSupply,
            creator: req.body.creator,
            creatorName: user.length > 0? user[0].name: '',
            holderCount: req.body.holderCount,
            image: req.body.image,
            video: req.body.video,
            title: req.body.title,
            category0: req.body.category0,
            category1: req.body.category1,
            category2: req.body.category2,
            category3: req.body.category3,
            category4: req.body.category4,
            description: req.body.description,
            attributes: req.body.attributes,
            tags: req.body.tags,
            priceUSD: 0,
            favoriteCount: 0,
            commentCount: 0,
            timestamp: new Date(),
            lastSoldPriceUSD: 0.0,
            lastSoldTime: new Date(),
            tradeCount: 0,
            tradeVolume: 0.0,
            visited: 0
        };

        var items = await NFT.find({
            collectionAddress: newItem.collectionAddress,
            tokenId: newItem.tokenId,
        })

        if (items.length > 0) {
            await NFT.findByIdAndUpdate(items[0]._id, newItem);
        } else {
            var ret = await new NFT(newItem);
            await ret.save();
        }

        await updateOwnerInfo(newItem.collectionAddress, newItem.tokenId, newItem.creator);
        await addSubscriberItems(newItem.creator, newItem.totalSupply);

        res.json({ msg: 'added a new NFT', result: 1 });
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

const updateOwnerInfo = async (collectionAddress, tokenId, owner) => {
    let ownerFindItem = {
        collectionAddress: collectionAddress.toLowerCase(),
        tokenId: tokenId,
        owner: owner.toLowerCase()
    };

    let ownerItems = await Owner.find(ownerFindItem);

    let balance = await getBalance(collectionAddress.toLowerCase(), tokenId, owner);
    if (balance === undefined)
        return;

    if (ownerItems.length > 0) {
        ownerItems[0].balance = balance;
        await Owner.findByIdAndUpdate(ownerItems[0]._id, ownerItems[0]);
    } else {
        ownerFindItem.balance = balance;
        let ret = await new Owner(ownerFindItem);
        await ret.save();
    }
}

const updateHolderCount = async (collectionAddress, tokenId) => {
    let nftFindItem = {
        collectionAddress: collectionAddress.toLowerCase(),
        tokenId: tokenId
    };

    let nftItems = await NFT.find(nftFindItem);

    let holders = await getHolderCount(collectionAddress.toLowerCase(), tokenId);
    if (holders === undefined)
        return;

    if (nftItems.length > 0) {
        nftItems[0].holderCount = holders;
        await NFT.findByIdAndUpdate(nftItems[0]._id, nftItems[0]);
    }
}

const addSubscriberItems = async (user, addCount) => {
    let ret = await Subscriber.find({
        address: user.toLowerCase()
    })

    if (ret.length == 0) return;

    let item = ret[0];
    if (item.holders === undefined || item.holders === 0) {
        item.holders = 1;
    }

    if (item.items === undefined || item.items === 0) {
        item.items = addCount;
    } else {
        item.items += addCount;
    }

    if (item.favoriteCount === undefined) {
        item.favoriteCount = 0;
    }

    if (item.commentCount === undefined) {
        item.commentCount = 0;
    }

    if (item.floorPrice === undefined) {
        item.floorPrice = 0.0;
    }

    if (item.ceilPrice === undefined) {
        item.ceilPrice = 0.0;
    }

    if (item.volumeTrade === undefined) {
        item.volumeTrade = 0.0;
    }

    await Subscriber.findByIdAndUpdate(item._id, item);
}

const updateHoldersItemsInfo = async (collectionAddress, tokenId, from, to, copy) => {
    const creatorRole = await Role.find({ name: models.ROLES[1] }).limit(1);

    let fromUsers = await Subscriber.find({
        address: from.toLowerCase()
    })

    let toUsers = await Subscriber.find({
        address: to.toLowerCase()
    })

    if (fromUsers.length > 0) {
        let fromUser = fromUsers[0];
        let balance = await getBalance(collectionAddress.toLowerCase(), tokenId, from);

        if (fromUser.holders === undefined) fromUser.holders = 1;

        if (balance === 0) {
            let creatorAddress = await getCreator(collectionAddress.toLowerCase(), tokenId);
            let creators = await Subscriber.find({ address: creatorAddress.toLowerCase() })
            if (creators.length > 0 && creators[0].roles[0].toString() === creatorRole[0]._id.toString()) {
                creators[0].holders --;
                await Subscriber.findByIdAndUpdate(creators[0]._id, creators[0]);
            }
        }
        fromUser.items = balance;
        await Subscriber.findByIdAndUpdate(fromUser._id, fromUser);
    }

    if (toUsers.length > 0) {
        let toUser = toUsers[0];
        let balance = await getBalance(collectionAddress.toLowerCase(), tokenId, to);

        if (toUser.holders === undefined) toUser.holders = 1;

        if (balance === copy) {
            let creatorAddress = await getCreator(collectionAddress.toLowerCase(), tokenId);
            let creators = await Subscriber.find({ address: creatorAddress.toLowerCase() })
            if (creators.length > 0 && creators[0].roles[0].toString() === creatorRole[0]._id.toString()) {
                creators[0].holders ++;
                await Subscriber.findByIdAndUpdate(creators[0]._id, creators[0]);
            }
        }

        toUser.items = balance;
        await Subscriber.findByIdAndUpdate(toUser._id, toUser);
    }
}

const updateVolumeTrade = async (seller, copy, priceUSD) => {
    let users = await Subscriber.find({
        address: seller.toLowerCase()
    })

    if (users.length == 0) return;

    let user = users[0];
    if (user.volumeTrade === undefined)
        user.volumeTrade = 0.0;

    user.volumeTrade += copy * priceUSD;

    user.lastSoldPriceUSD = priceUSD;
    user.lastSoldTime = new Date();

    await Subscriber.findByIdAndUpdate(user._id, user);
}

const updateNFTTradeInfo = async (collectionAddress, tokenId, priceUSD, copy) => {
    let nfts = await NFT.find({
        collectionAddress: collectionAddress.toLowerCase(),
        tokenId: tokenId
    })

    if (nfts.length == 0) return;

    let nft = nfts[0];
    nft.lastSoldPriceUSD = priceUSD;
    nft.lastSoldTime = new Date();

    if (nft.tradeCount === undefined) nft.tradeCount = 1;
    else nft.tradeCount ++;

    if (nft.tradeVolume === undefined) nft.tradeVolume = copy * priceUSD;
    else nft.tradeVolume += copy * priceUSD;

    await NFT.findByIdAndUpdate(nft._id, nft);
}

module.exports = router;
module.exports.updateOwnerInfo = updateOwnerInfo;
module.exports.updateHoldersItemsInfo = updateHoldersItemsInfo;
module.exports.updateVolumeTrade = updateVolumeTrade;
module.exports.updateHolderCount = updateHolderCount;
module.exports.updateNFTTradeInfo = updateNFTTradeInfo;
