const mongoose = require("mongoose");

const Offer = mongoose.model(
    "Offer",
    new mongoose.Schema({
        saleId: Number,
        collectionAddress: String,
        tokenId: Number,
        seller: String,
        sellerName: String,
        copy: Number,
        price: Number,
        priceUSD: Number,
        payment: Number,
        paymentName: String,
        start: Date,
        duration: Number,
        address: String,
        name: String
    })
);

module.exports = Offer;
