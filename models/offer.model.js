const mongoose = require("mongoose");

const Offer = mongoose.model(
    "Offer",
    new mongoose.Schema({
        contract: String,
        tokenId: Number,
        quantity: Number,
        payment: Number,
        price: String,
        days: String,
        hhmm: String,
        start: Date,
        name: String,
        address: String
    })
);

module.exports = Offer;
