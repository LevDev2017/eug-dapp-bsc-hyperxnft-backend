const mongoose = require("mongoose");

const Sale = mongoose.model(
    "Sale",
    new mongoose.Schema({
        contract: String,
        tokenId: Number,
        payment: Number,
        price: String,
        days: String,
        hhmm: String,
        start: Date,
        name: String,
        address: String
    })
);

module.exports = Sale;
