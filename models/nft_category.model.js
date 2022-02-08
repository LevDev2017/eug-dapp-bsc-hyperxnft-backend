const mongoose = require("mongoose");

const NFTCategory = mongoose.model(
    "NFTCategory",
    new mongoose.Schema({
        creator: String,
        creatorName: String,
        depth0: String,
        depth1: String,
        depth2: String,
        depth3: String,
        depth4: String
    })
);

module.exports = NFTCategory;
