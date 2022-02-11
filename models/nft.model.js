const mongoose = require("mongoose");

const NFT = mongoose.model(
    "NFT",
    new mongoose.Schema({
        collectionAddress: String,
        tokenId: Number,
        URI: String,
        totalSupply: Number,
        creator: String,
        creatorName: String,
        holderCount: Number,
        image: String,
        video: Boolean,
        title: String,
        category0: String,
        category1: String,
        category2: String,
        category3: String,
        category4: String,
        description: String,
        attributes: String,
        tags: String,
        priceUSD: Number,
        favoriteCount: Number,
        commentCount: Number,
        timestamp: Date,
        lastSoldPriceUSD: Number,
        lastSoldTime: Date,
        tradeCount: Number,
        tradeVolume: Number,
        visited: Number
    })
);

module.exports = NFT;
