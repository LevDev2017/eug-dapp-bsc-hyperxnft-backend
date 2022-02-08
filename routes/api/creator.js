// routes/api/creator.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Creator = models.creator;
const Subscriber = models.subscriber;

// @route PUT api/creator
// @description creator information request from users
// @access public

router.get('/', async (req, res) => {
    try {
        if (req.query.info === 'all') {
            let items = await Creator.find();
            let i;
            for (i = 0; i < items.length; i++) {
                let subscriberInfo = await Subscriber.find({
                    name: items[i].name,
                    email: items[i].email,
                    password: items[i].password,
                    address: items[i].address,
                })

                if (subscriberInfo.length > 0) {
                    items[i] = {
                        ...items[i]._doc,
                        avatarURI: subscriberInfo[0].avatarURI,
                        coverURI: subscriberInfo[0].coverURI,
                        businessName: subscriberInfo[0].businessName,
                        bio: subscriberInfo[0].bio,
                        notification: subscriberInfo[0].notification,
                        floorPrice: subscriberInfo[0].floorPrice,
                        ceilPrice: subscriberInfo[0].ceilPrice,
                        volumeTrade: subscriberInfo[0].volumeTrade,
                        holders: subscriberInfo[0].holders,
                        items: subscriberInfo[0].items,
                        favoriteCount: subscriberInfo[0].favoriteCount,
                        commentCount: subscriberInfo[0].commentCount
                    };
                }
            }

            res.json({ result: 1, creators: items });
        } else {
            res.json({ result: 0, msg: 'not implemented' });
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error: ${err.message}`, result: 0 });
    }
});

module.exports = router;
