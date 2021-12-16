// routes/api/comment.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Comment = models.comment;

// @route POST api/comment
// @description post comment information request from users
// @access public

router.post('/', async (req, res) => {
    const commentData = req.body;

    var strNow = new Date().toLocaleString();
    // console.log("now: ", strNow);
    // var date = new Date(strNow);
    // console.log("again: ", date.toLocaleString());

    var newHistory = new Comment({
        contract: commentData.contract,
        tokenId: commentData.tokenId,
        content: commentData.content,
        user: commentData.user,
        address: commentData.address,
        role: commentData.role,
        time: strNow
    });

    await newHistory.save();

    res.json({msg: 'ok'});
});

module.exports = router;
