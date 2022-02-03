const mongoose = require("mongoose");

const Subscriber = mongoose.model(
    "Subscriber",
    new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        address: String,
        avatarURI: String,
        coverURI: String,
        businessName: String,
        bio: String,
        notification: String,
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }]
    })
);

module.exports = Subscriber;
