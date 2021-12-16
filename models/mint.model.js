const mongoose = require("mongoose");

const Mint = mongoose.model(
    "Mint",
    new mongoose.Schema({
        owner: String,
        email: String,
        password: String,
        when: Number
    })
);

module.exports = Mint;
