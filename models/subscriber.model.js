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
        role: String,
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }],
        floorPrice: Number,
        ceilPrice: Number,
        volumeTrade: Number,
        holders: Number,
        items: Number,
        favoriteCount: Number,
        commentCount: Number,
    })
);

module.exports = Subscriber;
