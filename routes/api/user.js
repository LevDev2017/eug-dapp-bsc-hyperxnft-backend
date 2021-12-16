// routes/api/user.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Subscriber = models.subscriber;

// @route POST api/user
// @description user information request from users
// @access public

router.get('/', async (req, res) => {
    var query = req.query;
    if (query !== undefined && query.address !== undefined) {

        var items = await Subscriber.find({
            address: query.address.toLowerCase()
        });

        if (items !== undefined && items.length > 0) {
            res.json({msg: 'found', name: items[0].name});
        } else {
            res.json({msg: 'not found'});
        }
    }
});

router.get('/:user', (req, res) => {
    res.json({msg: 'ok'});
});

module.exports = router;
