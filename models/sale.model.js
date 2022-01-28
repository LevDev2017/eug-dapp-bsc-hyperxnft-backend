const mongoose = require("mongoose");

const Sale = mongoose.model(
    "Sale",
    new mongoose.Schema({
        collectionAddress: String,
        tokenId: Number,
        payment: Number,
        paymentName: String,
        price: Number,
        seller: String,
        fee: Number,
        royalty: Number,
        start: Date,
        duration: Number,
        address: String,
        when: Date,
    })
);

module.exports = Sale;
