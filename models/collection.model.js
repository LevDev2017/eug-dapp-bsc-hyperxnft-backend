const mongoose = require("mongoose");

const Collection = mongoose.model(
    "Collection",
    new mongoose.Schema({
        name: String,
        description: String,
        bannerURI: String,
        logoURI: String,
        contractAddress: String,
        user: String,
        walletAddress: String,
        owner: String,
        timestamp: Date
    })
);

module.exports = Collection;
