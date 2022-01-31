// app.js

const express = require('express');
const bodyParser = require("body-parser");
const connectDB = require('./config/db');
const cors = require('cors');
const signup_router = require('./routes/api/signup');
const signin_router = require('./routes/api/signin');
const signout_router = require('./routes/api/signout');
const user_router = require('./routes/api/user');
const comment_router = require('./routes/api/comment');
const nft_router = require('./routes/api/nft');
const payment_router = require('./routes/api/payment');
const { explorer_nfts } = require('./contracts/nft_list');
const price_scan = require('./contracts/price_scan');
const sale_router = require('./routes/api/sale');
const trade_router = require('./routes/api/trade');
const offer_router = require('./routes/api/offer');
const favorite_router = require('./routes/api/favorite');
const { collection_router } = require('./routes/api/collection');
const contract_router = require('./routes/api/contract');

const app = express();

connectDB();

app.use(cors({origin: true, credentials: true}));

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('Welcome to HyperX NFT Marketplace!'));

app.use('/api/signup', signup_router);
app.use('/api/signin', signin_router);
app.use('/api/signout', signout_router);
app.use('/api/user', user_router);
app.use('/api/comment', comment_router);
app.use('/api/nft', nft_router);
app.use('/api/payment', payment_router);
app.use('/api/sale', sale_router);
app.use('/api/trade', trade_router);
app.use('/api/offer', offer_router);
app.use('/api/favorite', favorite_router);
app.use('/api/collection', collection_router);
app.use('/api/contract', contract_router);

const port = process.env.PORT || 8082;

explorer_nfts();
price_scan();

app.listen(port, () => console.log(`Server running on port ${port}`));
