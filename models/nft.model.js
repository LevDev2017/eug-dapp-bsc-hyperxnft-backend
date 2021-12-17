const mongoose = require("mongoose");

const NFT = mongoose.model(
    "NFT",
    new mongoose.Schema({
        collectionName: String,
        symbol: String,
        contract: String,
        tokenId: Number,
        URI: String,
        owner: String,
        name: String,
        price: String,
        payment: Number,
        transferCount: Number,
        onSale: Boolean,
        title: String,
        category: String,
        description: String,
        hashtags: String
    })
);

module.exports = NFT;
