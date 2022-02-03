const mongoose = require("mongoose");

const Owner = mongoose.model(
    "Owner",
    new mongoose.Schema({
        collectionAddress: String,
        tokenId: Number,
        owner: String,
        balance: Number
    })
);

module.exports = Owner;
