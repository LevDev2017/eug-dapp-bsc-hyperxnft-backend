const mongoose = require("mongoose");

const Sale = mongoose.model(
    "Sale",
    new mongoose.Schema({
        collectionAddress: String,
        tokenId: Number,
        saleId: Number,
        copy: Number,
        method: Number,
        payment: Number,
        paymentName: String,
        price: Number,
        seller: String,
        sellerName: String,
        fee: Number,
        royalty: Number,
        start: Date,
        duration: Number,
        when: Date,
    })
);

module.exports = Sale;
