const mongoose = require("mongoose");

const Notification = mongoose.model(
    "Notification",
    new mongoose.Schema({
        username: String,
        address: String,
        addressFor: String,
        avatarURI: String,
        text: String,
        when: Date
    })
);

module.exports = Notification;
