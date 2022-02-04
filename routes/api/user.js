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

router.get('/:user', (req, res) => {
    res.json({ msg: 'ok' });
});

module.exports = router;
