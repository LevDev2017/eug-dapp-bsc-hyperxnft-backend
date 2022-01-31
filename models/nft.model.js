const mongoose = require("mongoose");

const NFT = mongoose.model(
    "NFT",
    new mongoose.Schema({
        collectionAddress: String,
        tokenId: Number,
        URI: String,
        totalSupply: Number,
        creator: String,
        holderCount: Number,
        image: String,
        video: Boolean,
        title: String,
        category: String,
        description: String,
        attributes: String,
        tags: String,
        priceUSD: Number,
        favoriteCount: Number,
        commentCount: Number,
        timestamp: Date
    })
);

module.exports = NFT;
