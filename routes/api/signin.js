// routes/api/signin.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Role = models.role;
const Subscriber = models.subscriber;
const LogIn = models.login;

// @route POST api/signin
// @description sign in request from users
// @access public

router.post('/', (req, res) => {
    const signinData = req.body;

    // try to find in the list of signed up users by name.
    Subscriber.find({
        name: signinData.name,
        password: signinData.password
    })
        .then(async (item) => {
            if (item.length > 0) { // signed up user tries to sign in.
                var newItem = await Subscriber.findByIdAndUpdate(item[0]._id, {
                    address: signinData.address
                }, {
                    returnDocument: 'after'
                });

                var role = await Role.findById(item[0].roles[0]);
                res.json({ msg: 'signed in', result: 1, role: role.name });

                var strNow = new Date().toLocaleString();
                // console.log("now: ", strNow);
                // var date = new Date(strNow);
                // console.log("again: ", date.toLocaleString());

                var newHistory = new LogIn({
                    action: "sign-in",
                    email: newItem.email,
                    name: newItem.name,
                    address: newItem.address,
                    role: role.name,
                    time: strNow
                });

                await newHistory.save();
            } else {
                // not found by name, try to find by email.
                Subscriber.find({
                    email: signinData.name,
                    password: signinData.password
                })
                    .then(async (item) => {
                        if (item.length > 0) { // signed up user tries to sign in.
                            var newItem = await Subscriber.findByIdAndUpdate(item[0]._id, {
                                address: signinData.address
                            }, {
                                returnDocument: 'after'
                            });

                            var role = await Role.findById(item[0].roles[0]);
                            res.json({ msg: 'signed in', result: 1, role: role.name });

                            var strNow = new Date().toLocaleString();
                            // console.log("now: ", strNow);
                            // var date = new Date(strNow);
                            // console.log("again: ", date.toLocaleString());

                            var newHistory = new LogIn({
                                action: "sign-in",
                                email: newItem.email,
                                name: newItem.name,
                                address: newItem.address,
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
                        console.log('failed to look up subscriber list for sign in');
                        res.json({ msg: 'failed to sign in', result: 0 });
                    })
            }
        })
        .catch(async (err) => {
            console.log('failed to look up subscriber list for sign in');
            res.json({ msg: 'failed to sign in', result: 0 });
        })
});

module.exports = router;