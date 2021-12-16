const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.subscriber = require("./subscriber.model");
db.creator = require("./creator.model");
db.role = require("./role.model");
db.mint = require("./mint.model");
db.login = require("./login.model");
db.comment = require("./comment.model");

db.ROLES = ["user", "creator", "admin"];

module.exports = db;
