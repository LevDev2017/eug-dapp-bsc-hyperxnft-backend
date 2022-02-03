const mongoose = require("mongoose");

const Trade = mongoose.model(
    "Trade",
    new mongoose.Schema({
        collectionAddress: String,
        tokenId: Number,
        saleId: Number,
        copy: Number,
        method: String,
        payment: Number,
        paymentName: String,
        basePrice: Number,
        priceUSD: Number,
        seller: String,
        sellerName: String,
        fee: Number,
        royalty: Number,
        winner: String,
        winnerName: String,
        payOut: Number,
        creator: String,
        creatorName: String,
        owner: String,
        ownerName: String,
        when: Date,
    })
);

module.exports = Trade;
