const mongoose = require("mongoose");

const PaymentConversion = mongoose.model(
    "PaymentConversion",
    new mongoose.Schema({
        name: String,
        ratio: String
    })
);

module.exports = PaymentConversion;
