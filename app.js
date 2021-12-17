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
const { explorer_nfts } = require('./contracts/nft_list');
const price_scan = require('./contracts/price_scan');

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

const port = process.env.PORT || 8082;

explorer_nfts();
price_scan();

app.listen(port, () => console.log(`Server running on port ${port}`));
