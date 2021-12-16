// routes/api/signup.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const Role = models.role;
const Subscriber = models.subscriber;
const Creator = models.creator;
const LogIn = models.login;

// @route POST api/signup
// @description sign up request from users
// @access public

router.post('/', (req, res) => {
    const signupData = req.body;

    // try to find in the list of signed up users.
    Subscriber.find({
        email: signupData.email,
        name: signupData.name,
        password: signupData.password
    })
        .then(async (item) => {
            // not signed up user, check if it is in the list of creators
            const userRole = await Role.find({ name: models.ROLES[0] }).limit(1);

            if (item.length == 0) {
                var found = await Creator.find({
                    email: signupData.email,
                    name: signupData.name,
                    password: signupData.password
                });

                var role = userRole[0];
                if (found !== undefined && found.length > 0) {
                    role = await Role.findById(found[0].roles[0]);
                }

                var address_found = await Subscriber.find({ address: signupData.address});

                if (address_found !== undefined && address_found.length > 0) {
                    await Subscriber.findByIdAndUpdate(address_found[0]._id, {
                        name: signupData.name,
                        email: signupData.email,
                        password: signupData.password,
                        address: signupData.address,
                        roles: [role._id]
                    });
                } else {
                    var ret = new Subscriber({
                        name: signupData.name,
                        email: signupData.email,
                        password: signupData.password,
                        address: signupData.address,
                        roles: [role._id]
                    });
                    await ret.save();
                }
                res.json({ msg: 'signed up', result: 1, role: role.name });

                var strNow = new Date().toLocaleString();
                // console.log("now: ", strNow);
                // var date = new Date(strNow);
                // console.log("again: ", date.toLocaleString());

                var newHistory = new LogIn({
                    action: "sign-up",
                    email: signupData.email,
                    name: signupData.name,
                    address: signupData.address,
                    role: role.name,
                    time: strNow
                });

                await newHistory.save();
            } else {
                var found = await Creator.find({
                    email: signupData.email,
                    name: signupData.name,
                    password: signupData.password
                });

                await Subscriber.findByIdAndUpdate(item[0]._id, {
                    address: signupData.address
                });

                var role = await Role.findById(item[0].roles[0]);
                res.json({ msg: 'already signed up', result: 1, role: role.name });

                var strNow = new Date().toLocaleString();
                // console.log("now: ", strNow);
                // var date = new Date(strNow);
                // console.log("again: ", date.toLocaleString());

                var newHistory = new LogIn({
                    action: "sign-up",
                    email: signupData.email,
                    name: signupData.name,
                    address: signupData.address,
                    role: role.name,
                    time: strNow
                });

                await newHistory.save();
            }
            
        })
        .catch(async (err) => {
            console.log('failed to look up subscriber list for signup');
            res.json({ msg: 'failed to sign up', result: 0 });
        })
});

module.exports = router;