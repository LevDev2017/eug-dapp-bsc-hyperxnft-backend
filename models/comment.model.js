const mongoose = require("mongoose");

const Comment = mongoose.model(
    "Comment",
    new mongoose.Schema({
        contract: String,
        tokenId: String,
        content: String,
        favorite: Number,
        set: Boolean,
        user: String,
        role: String,
        address: String,
        time: Date
    })
);

module.exports = Comment;
