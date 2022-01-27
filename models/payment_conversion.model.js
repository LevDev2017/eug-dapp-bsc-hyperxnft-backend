const mongoose = require("mongoose");

const PaymentConversion = mongoose.model(
    "PaymentConversion",
    new mongoose.Schema({
        id: Number,
        name: String,
        ratio: String
    })
);

module.exports = PaymentConversion;
