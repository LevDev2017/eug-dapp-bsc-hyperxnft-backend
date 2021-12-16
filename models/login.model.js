const mongoose = require("mongoose");

const LogIn = mongoose.model(
    "LogIn",
    new mongoose.Schema({
        action: String,
        name: String,
        email: String,
        address: String,
        role: String,
        time: Date
    })
);

module.exports = LogIn;
