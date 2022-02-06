const mongoose = require("mongoose");

const Bid = mongoose.model(
    "Bid",
    new mongoose.Schema({
        collectionAddress: String,
        tokenId: Number,
        saleId: Number,
        copy: Number,
        payment: Number,
        paymentName: String,
        bidPrice: Number,
        priceUSD: Number,
        seller: String,
        sellerName: String,
        bidder: String,
        bidderName: String,
        when: Date
    })
);

module.exports = Bid;
