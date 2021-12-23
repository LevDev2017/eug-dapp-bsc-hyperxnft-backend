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
                if (item[0].address === signinData.address) {
                    var role = await Role.findById(item[0].roles[0]);

                    var strNow = new Date().toLocaleString();
                    // console.log("now: ", strNow);
                    // var date = new Date(strNow);
                    // console.log("again: ", date.toLocaleString());

                    var newHistory = new LogIn({
                        action: "sign-in",
                        email: signinData.email,
                        name: signinData.name,
                        address: signinData.address,
                        role: role.name,
                        time: strNow
                    });

                    await newHistory.save();

                    res.json({ msg: 'signed in', result: 1, role: role.name });
                } else {
                    var waUser = await Subscriber.find({
                        address: signinData.address
                    })

                    let msgText = `failed to sign in, ${item[0].name} has already signed up with ${item[0].address}`;
                    if (waUser !== undefined && waUser.length > 0) {
                        msgText += `\nPlease sign in as ${waUser[0].name} instead`;
                    }
                    res.json({ msg:  msgText});
                }
            } else {
                // not found by name, try to find by email.
                Subscriber.find({
                    email: signinData.name,
                    password: signinData.password
                })
                    .then(async (item) => {
                        if (item.length > 0) { // signed up user tries to sign in.
                            if (signinData.address === item[0].address) {
                                var role = await Role.findById(item[0].roles[0]);

                                var strNow = new Date().toLocaleString();
                                // console.log("now: ", strNow);
                                // var date = new Date(strNow);
                                // console.log("again: ", date.toLocaleString());

                                var newHistory = new LogIn({
                                    action: "sign-in",
                                    email: signinData.email,
                                    name: signinData.name,
                                    address: signinData.address,
                                    role: role.name,
                                    time: strNow
                                });

                                await newHistory.save();

                                res.json({ msg: 'signed in', result: 1, role: role.name });
                            } else {
                                res.json({ msg: `failed to sign in, ${item[0].name} has already signed up with ${item[0].address}` });
                            }
                        } else {
                            console.log('not signed up');
                            res.json({ msg: 'not signed up', result: 0 });
                        }
                    })
                    .catch(async (err) => {
                        console.log(`failed to look up subscriber list to sign in: ${err}`);
                        res.json({ msg: 'failed to sign in', result: 0 });
                    })
            }
        })
        .catch(async (err) => {
            console.log(`failed to look up subscriber list to sign in: ${err}`);
            res.json({ msg: 'failed to sign in', result: 0 });
        })
});

module.exports = router;