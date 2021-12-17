const mongoose = require("mongoose");

const Payment = mongoose.model(
    "Payment",
    new mongoose.Schema({
        payment: Number,
        name: String,
        decimal: Number
    })
);

module.exports = Payment;
