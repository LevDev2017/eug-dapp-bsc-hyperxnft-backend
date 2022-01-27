const mongoose = require("mongoose");

const Favorite = mongoose.model(
    "Favorite",
    new mongoose.Schema({
        collectionAddress: String,
        tokenId: Number,
        name: String,
        address: String,
        when: Date
    })
);

module.exports = Favorite;
