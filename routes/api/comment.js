// routes/api/comment.js

const express = require('express');
const { getTimeGap } = require('../../platform/time');
const router = express.Router();
const models = require('../../models');

const Comment = models.comment;
const Favorite = models.favorite;

// @route POST api/comment
// @description post comment information request from users
// @access public

router.post('/', async (req, res) => {
    const commentData = req.body;

    var strNow = new Date().toLocaleString();
    // console.log("now: ", strNow);
    // var date = new Date(strNow);
    // console.log("again: ", date.toLocaleString());

    var favCount = await Favorite.find({
        collectionAddress: commentData.collectionAddress,
        tokenId: commentData.tokenId
    }).countDocuments();

    var items = await Favorite.find({
        collectionAddress: commentData.collectionAddress,
        tokenId: commentData.tokenId
    });

    var found = items.find(t => t.address.toLowerCase() === commentData.address.toLowerCase());

    var newHistory = new Comment({
        collectionAddress: commentData.collectionAddress,
        tokenId: commentData.tokenId,
        content: commentData.content,
        favorite: favCount,
        set: found !== undefined,
        user: commentData.user,
        address: commentData.address,
        role: commentData.role,
        time: strNow
    });

    await newHistory.save();

    res.json({msg: 'ok', result: 1});
});

// @route GET api/comment
// @description GET comment information request to users
// @access public

router.get('/', async (req, res) => {
    try {
        const { collectionAddress, tokenId } = req.query;
        var items = await Comment.find({
            collectionAddress: collectionAddress,
            tokenId: parseInt(tokenId)
        });

        if (items.length === 0) {
            res.json({ msg: 'no comments' });
        } else {
            var tnow = new Date;
            items.forEach((part, index, arr) => {
                arr[index]._doc = {...part._doc, timespan: getTimeGap(tnow, part.time)};
            });
            res.json({ msg: 'found comments', res: items});
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}` });
    }
});


// @route GET api/comment/count
// @description GET comment count to users
// @access public

router.get('/count', async (req, res) => {
    try {
        const { collectionAddress, tokenId } = req.query;
        var items = await Comment.find({
            collectionAddress: collectionAddress,
            tokenId: parseInt(tokenId)
        });

        res.json({ msg: 'comment count', count: items.length});
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}` });
    }
});


module.exports = router;
