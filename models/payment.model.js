const mongoose = require("mongoose");

const Payment = mongoose.model(
    "Payment",
    new mongoose.Schema({
        id: Number,
        name: String,
        decimal: Number,
        contract: String
    })
);

module.exports = Payment;
