const mongoose = require("mongoose");

const Creator = mongoose.model(
    "Creator",
    new mongoose.Schema({
        address: String,
        name: String,
        email: String,
        password: String,
        projectName: String,
        projectDescription: String,
        category: String,
        tags: String,
        status: String,
        payment: String,

        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }]
    })
);

module.exports = Creator;
