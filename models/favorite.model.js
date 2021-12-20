const mongoose = require("mongoose");

const Favorite = mongoose.model(
    "Favorite",
    new mongoose.Schema({
        contract: String,
        tokenId: Number,
        name: String,
        address: String,
        when: Date
    })
);

module.exports = Favorite;
