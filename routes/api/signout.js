// routes/api/signin.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Role = models.role;
const Subscriber = models.subscriber;
const LogIn = models.login;

// @route POST api/signout
// @description sign out request from users
// @access public

router.post('/', (req, res) => {
    const signOutData = req.body;

    // try to find in the list of signed up users by name.
    Subscriber.find({
        name: signOutData.name,
        password: signOutData.password
    })
        .then(async (item) => {
            if (item.length > 0) { // signed up user tries to sign in.
                // await Subscriber.findByIdAndRemove(item[0]._id);
                res.json({ msg: 'signed out', result: 1 });

                var oldItem = await Subscriber.findById(item[0]._id);

                var role = await Role.findById(item[0].roles[0]);
                var strNow = new Date().toLocaleString();
                // console.log("now: ", strNow);
                // var date = new Date(strNow);
                // console.log("again: ", date.toLocaleString());

                var newHistory = new LogIn({
                    action: "sign-out",
                    email: oldItem.email,
                    name: oldItem.name,
                    address: oldItem.address,
                    role: role.name,
                    time: strNow
                });

                await newHistory.save();
            } else {
                // not found by name, try to find by email.
                Subscriber.find({
                    email: signOutData.name,
                    password: signOutData.password
                })
                    .then(async (item) => {
                        if (item.length > 0) { // signed up user tries to sign in.
                            // await Subscriber.findByIdAndRemove(item[0]._id);

                            res.json({ msg: 'signed out', result: 1 });

                            var oldItem = await Subscriber.findById(item[0]._id);

                            var role = await Role.findById(item[0].roles[0]);
                            var strNow = new Date().toLocaleString();
                            // console.log("now: ", strNow);
                            // var date = new Date(strNow);
                            // console.log("again: ", date.toLocaleString());

                            var newHistory = new LogIn({
                                action: "sign-out",
                                email: oldItem.email,
                                name: oldItem.name,
                                address: oldItem.address,
                                role: role.name,
                                time: strNow
                            });

                            await newHistory.save();
                        } else {
                            console.log('not signed up');
                            res.json({ msg: 'not signed up', result: 0 });
                        }
                    })
                    .catch(async (err) => {
                        console.log('failed to look up subscriber list for sign out');
                        res.json({ msg: 'failed to sign out', result: 0 });
                    })
            }
        })
        .catch(async (err) => {
            console.log('failed to look up subscriber list for sign out');
            res.json({ msg: 'failed to sign out', result: 0 });
        })
});

module.exports = router;