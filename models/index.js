const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.subscriber = require("./subscriber.model");
db.creator = require("./creator.model");
db.role = require("./role.model");
db.login = require("./login.model");
db.comment = require("./comment.model");
db.NFT = require("./nft.model");
db.payment = require("./payment.model");
db.payment_conversion = require("./payment_conversion.model");
db.sale = require("./sale.model");
db.trade = require("./trade.model");
db.offer = require("./offer.model");
db.favorite = require("./favorite.model");
db.collection = require("./collection.model");
db.owner = require("./owner.model");

db.ROLES = ["user", "creator", "admin"];

module.exports = db;
