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
                        email: item[0].email,
                        name: item[0].name,
                        address: item[0].address.toLowerCase(),
                        role: role.name,
                        time: strNow
                    });

                    await newHistory.save();

                    res.json({ msg: 'signed in', result: 1, role: role.name, info: item[0] });
                } else {
                    var waUser = await Subscriber.find({
                        address: signinData.address.toLowerCase()
                    })

                    let msgText = `failed to sign in, ${item[0].name} has already signed up with ${item[0].address}`;
                    if (waUser !== undefined && waUser.length > 0) {
                        msgText += `\nPlease sign in as ${waUser[0].name} instead`;
                    }
                    res.json({ msg: msgText });
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
                                    email: item[0].email,
                                    name: item[0].name,
                                    address: item[0].address.toLowerCase(),
                                    role: role.name,
                                    time: strNow
                                });

                                await newHistory.save();

                                res.json({ msg: 'signed in', result: 1, role: role.name, info: item[0] });
                            } else {
                                res.json({ msg: `failed to sign in, ${item[0].name} has already signed up with ${item[0].address}` });
                            }
                        } else {
                            console.log('not signed up or incorrect password');
                            res.json({ msg: 'not signed up or incorrect password', result: 0 });
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


// @route POST api/signin/profile
// @description update profile request from users
// @access public

router.post('/profile', (req, res) => {
    const profileData = req.body;

    Subscriber.find({
        name: profileData.name,
        password: profileData.password,
        address: profileData.address.toLowerCase()
    })
        .then(async (item) => {
            if (item.length > 0) {
                if (profileData.avatar !== undefined) {
                    await Subscriber.findByIdAndUpdate(item[0]._id, {
                        avatarURI: profileData.avatar
                    });
                }

                if (profileData.cover !== undefined) {
                    await Subscriber.findByIdAndUpdate(item[0]._id, {
                        coverURI: profileData.cover
                    });
                }

                if (profileData.businessName !== undefined) {
                    await Subscriber.findByIdAndUpdate(item[0]._id, {
                        businessName: profileData.businessName
                    });
                }

                if (profileData.bio !== undefined) {
                    await Subscriber.findByIdAndUpdate(item[0]._id, {
                        bio: profileData.bio
                    });
                }

                if (profileData.notification !== undefined) {
                    await Subscriber.findByIdAndUpdate(item[0]._id, {
                        notification: profileData.notification
                    });
                }

                res.json({ msg: 'Updated profile information', result: 1 });
            } else {
                res.json({ msg: 'No subscriber found', result: 0 });
            }
        })
        .catch(async (err) => {
            console.log(`failed to look up subscriber list to sign in: ${err}`);
            res.json({ msg: 'failed to find a user', result: 0 });
        })
});

router.get('/', async (req, res) => {
    try {
        const { address } = req.query;

        let users = await Subscriber.find({
            address: address.toLowerCase()
        })

        if (users.length > 0) {
            res.json({ user: users[0].name, result: 1 });
            return;
        } else {
            res.json({ user: '', result: 0 });
            return;
        }
    } catch (err) {
        console.log(err);
        res.json({ msg: `error ${err}`, result: 0 });
    }
});


module.exports = router;