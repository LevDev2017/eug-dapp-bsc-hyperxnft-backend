const mongoose = require("mongoose");

const Comment = mongoose.model(
    "Comment",
    new mongoose.Schema({
        collectionAddress: String,
        tokenId: String,
        content: String,
        favorite: Number,
        set: Boolean,
        user: String,
        avatar: String,
        role: String,
        address: String,
        time: Date
    })
);

module.exports = Comment;
