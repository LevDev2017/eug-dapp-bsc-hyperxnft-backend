const mongoose = require("mongoose");

const Subscriber = mongoose.model(
    "Subscriber",
    new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        address: String,
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }]
    })
);

module.exports = Subscriber;
