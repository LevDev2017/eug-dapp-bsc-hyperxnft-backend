// routes/api/user.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Subscriber = models.subscriber;
const Category = models.category;

// @route POST api/user
// @description user information request from users
// @access public

router.get('/', async (req, res) => {
    var query = req.query;
    if (query !== undefined) {
        try {
            if (query.address !== undefined) {
                var items = await Subscriber.find({
                    address: query.address.toLowerCase()
                });

                if (items !== undefined && items.length > 0) {
                    res.json({ msg: 'found', result: 1, name: items[0].name, user: items[0] });
                } else {
                    res.json({ msg: 'not found', result: 0 });
                }
            } else if (query.category !== undefined) {
                let items = await Category.find();
                res.json({ result: 1, categories: items });
            }
        } catch (err) {
            console.log(`${err.message}`);
            res.json({ result: 0 });
        }
    }
});

router.get('/statistics', async (req, res) => {
    try {
        let ret = {};
        let address = req.query.address.toLowerCase();
        let users = await Subscriber.find({ address: address });

        if (users.length == 0) return;

        ret.items = users[0].items;
        ret.holders = users[0].holders;
        ret.floorPrice = users[0].floorPrice;
        ret.favoriteCount = users[0].favoriteCount;
        ret.commentCount = users[0].commentCount;
        ret.volumeTrade = users[0].volumeTrade;

        res.json({ msg: 'calculated', result: 1, info: ret });
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

router.get('/:user', (req, res) => {
    res.json({ msg: 'ok' });
});

module.exports = router;
