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
        title: String,
        category: String,
        description: String,
        attributes: String,
        tags: String,
        timestamp: Date
    })
);

module.exports = NFT;
