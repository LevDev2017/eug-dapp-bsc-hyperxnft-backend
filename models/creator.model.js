const mongoose = require("mongoose");

const Creator = mongoose.model(
    "Creator",
    new mongoose.Schema({
        email: String,
        name: String,
        password: String,
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }]
    })
);

module.exports = Creator;
