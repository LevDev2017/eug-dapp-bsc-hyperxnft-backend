// routes/api/notification.js

const express = require('express');
const router = express.Router();
const models = require('../../models');
const { getTimeGap, getTimeGapSeconds } = require('../../platform/time');

const Notification = models.notification;
const Subscriber = models.subscriber;

// @route PUT api/notification
// @description notification from users
// @access public

router.get('/', async (req, res) => {
    try {
        if (req.query.address !== undefined) {
            let tt = await Notification.find({
                addressFor: req.query.address.toLowerCase()
            }).sort({
                when: -1
            }).limit(3);

            let now = new Date();

            let ar = tt.map(t => {
                return {
                    _id: t._id,
                    username: t.username,
                    address: t.address,
                    avatarURI: t.avatarURI,
                    text: t.text,
                    timespan: getTimeGap(now, t.when)
                }
            });
            res.json({result: 1, items: ar});
        }
    } catch (err) {
        console.log(`${err.message}`);
        res.json({msg: err.message, result: 0});
    }
})

const putNotification = async (addressFrom, addressTo, text) => {
    let fromUsers = await Subscriber.find({
        address: addressFrom
    })
    if (fromUsers.length === 0) return;

    let fromUser = fromUsers[0];

    let newNotification = {
        username: fromUser.name,
        address: addressFrom.toLowerCase(),
        addressFor: addressTo.toLowerCase(),
        avatarURI: fromUser.avatarURI || '',
        text: text,
        when: new Date()
    }

    let ret = new Notification(newNotification);
    await ret.save();
}

module.exports = router;
module.exports.putNotification = putNotification;
