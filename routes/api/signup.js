// routes/api/signup.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const { startPendingCreator, endPendingCreator } = require('../../contracts/nft_list')
const { delay } = require('../../platform/wait');

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
        password: signupData.password,
        address: signupData.address.toLowerCase()
    })
        .then(async (item) => {
            // not signed up user, check if it is in the list of creators
            const userRole = await Role.find({ name: models.ROLES[0] }).limit(1);

            if (item.length == 0) {
                var found = await Creator.find({
                    email: signupData.email,
                    name: signupData.name,
                    address: signupData.address.toLowerCase()
                });

                if (found !== undefined && found.length > 0) {
                    if (found[0].password !== signupData.password) {
                        res.json({ msg: 'password incorrect' });
                        return;
                    }
                }

                var role = userRole[0];
                if (found !== undefined && found.length > 0) {
                    role = await Role.findById(found[0].roles[0]);
                }

                var address_found = await Subscriber.find({ address: signupData.address });

                if (address_found !== undefined && address_found.length > 0) {
                    address_found[0].name = signupData.name;
                    address_found[0].email = signupData.email;
                    address_found[0].password = signupData.password;
                    address_found[0].address = signupData.address.toLowerCase();
                    address_found[0].role = role.name;
                    address_found[0].roles = [role._id];

                    await Subscriber.findByIdAndUpdate(address_found[0]._id, address_found[0]);
                    res.json({ msg: `signed up, replaced ${address_found[0].name}`, result: 1, role: role.name, info: address_found[0] });
                } else {
                    let newItem = {
                        name: signupData.name,
                        email: signupData.email,
                        password: signupData.password,
                        address: signupData.address.toLowerCase(),
                        role: role.name,
                        roles: [role._id]
                    }
                    var ret = new Subscriber(newItem);
                    await ret.save();
                    res.json({ msg: `signed up, added new`, result: 1, role: role.name, info: newItem });
                }

                var strNow = new Date().toLocaleString();
                // console.log("now: ", strNow);
                // var date = new Date(strNow);
                // console.log("again: ", date.toLocaleString());

                var newHistory = new LogIn({
                    action: "sign-up",
                    email: signupData.email,
                    name: signupData.name,
                    address: signupData.address.toLowerCase(),
                    role: role.name,
                    time: strNow
                });

                await newHistory.save();
            } else {
                var found = await Creator.find({
                    email: signupData.email,
                    name: signupData.name,
                    address: signupData.address.toLowerCase()
                });

                if (found !== undefined && found.length > 0 && item[0].roles[0] != found[0].roles[0]) {
                    item[0].roles = found[0].roles;
                    let foundRole = await Role.findById(found[0].roles[0]);
                    if (foundRole.length > 0)
                        item[0].role = foundRole[0].name;

                    await Subscriber.findByIdAndUpdate(item[0]._id, item[0]);
                }
                var role = await Role.findById(item[0].roles[0]);
                res.json({ msg: 'already signed up', result: 1, role: role.name, info: item[0] });
            }
        })
        .catch(async (err) => {
            console.log('failed to look up subscriber list for signup');
            res.json({ msg: 'failed to sign up', result: 0 });
        })
});

router.post('/creator', async (req, res) => {
    const signupCreatorData = req.body;

    const creatorRole = await Role.find({ name: models.ROLES[1] }).limit(1);

    try {
        let items = await Creator.find({
            address: signupCreatorData.address.toLowerCase()
        });

        let newItem = {
            address: signupCreatorData.address.toLowerCase(),
            name: signupCreatorData.name,
            email: signupCreatorData.email,
            password: signupCreatorData.password,
            projectName: signupCreatorData.projectName,
            projectDescription: signupCreatorData.projectDescription,
            category: signupCreatorData.category,
            tags: signupCreatorData.tags,
            status: 'pending',
            payment: '[0, 1, 2]',
            roles: [creatorRole[0]._id]
        };

        if (items === undefined || items.length == 0) {

            let tx = await startPendingCreator(newItem.address);
            if (tx === undefined) {
                newItem.status = 'failed';
            } else {
                ret = new Creator(newItem);
                await ret.save();
            }

            res.json({ msg: newItem.status, result: 1 });
        } else {
            if ('pending' === items[0].status) {
                res.json({ msg: 'Pending as a creator', result: 0 });
            } else if ('approved' === items[0].status) {
                res.json({ msg: 'Approved by an admin', result: 0 });
            } else if ('allowed' === items[0].status) {
                res.json({ msg: 'Already became a creator', result: 0 });
            } else {
                res.json({ msg: 'Failed', result: 0 });
            }
        }
    } catch (err) {
        console.log(err.message);
        res.json({ msg: `${err.message}`, result: 0 });
    }
});

const permitCreator = async (creator) => {
    if (creator.status === 'approved') {
        creator.status = 'allowed';

        let ret = 0;
        let tx = await endPendingCreator(creator.address);
        if (tx === undefined) {
            creator.status = 'failed';
            ret = 3;
        } else {
            let signupUsers = await Subscriber.find({
                address: creator.address.toLowerCase(),
                name: creator.name,
                email: creator.email
            });
            if (signupUsers.length > 0) {
                signupUsers[0].roles = creator.roles;
                let foundRole = await Role.findById(creator.roles[0]);
                if (foundRole.length > 0)
                    signupUsers[0].role = foundRole[0].name;

                await Subscriber.findByIdAndUpdate(signupUsers[0]._id, signupUsers[0]);
            }
        }

        await Creator.findByIdAndUpdate(creator._id, creator);

        return ret;
    } else if (creator.status === 'failed') {
        return 4;
    } else {
        return 1;
    }
}

const poll_creator_pending = async () => {
    let errString = '';

    const poll_creator_pending_inner = async () => {
        try {
            let creators = await Creator.find();
            let i;
            for (i = 0; i < creators.length; i++) {
                if (creators[i].status === 'approved') {
                    let ret = await permitCreator(creators[i]);
                }
            }
            errString = '';
        } catch (err) {
            let errText = err.toString();
            if (errString != errText) {
                errString = errText;
                console.log("poll_creator_pending: ", errText);
            }
        }
    }

    const recursive_run = () => {
        poll_creator_pending_inner()
            .then(() => {
                setTimeout(recursive_run, 1000);
            })
            .catch(err => {
                setTimeout(recursive_run, 1000);
            });
    }

    recursive_run();
}

module.exports = router;
module.exports.poll_creator_pending = poll_creator_pending;
