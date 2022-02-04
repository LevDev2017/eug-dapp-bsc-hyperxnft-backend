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
            // cryptoguy: for test only, just simulating administrator
            let ret = await permitCreator({ address: newItem.address, name: newItem.name, email: newItem.email });
            if (0 === ret) {
                res.json({ msg: 'Permitted as a creator', result: 1 });
            } else if (1 === ret) {
                res.json({ msg: 'Already creator', result: 1 });
            } else if (3 === ret) {
                res.json({ msg: 'There was an error while permitting on blockchain', result: 0 });
            } else if (4 === ret) {
                items[0].status = 'pending';
                await Creator.findByIdAndUpdate(items[0]._id, items[0]);
                res.json({ msg: 'Please try again', result: 0 });
            } else {
                res.json({ msg: 'This address is already in use', result: 0 });
            }
        }
    } catch (err) {
        console.log(err.message);
        res.json({ msg: `${err.message}`, result: 0 });
    }
});

const permitCreator = async (creatorInfo) => {
    let items = await Creator.find({
        address: creatorInfo.address.toLowerCase(),
        name: creatorInfo.name,
        email: creatorInfo.email
    });

    if (items.length > 0) {
        if (items[0].status === 'pending') {
            items[0].status = 'allowed';

            let ret = 0;
            let tx = await endPendingCreator(items[0].address);
            if (tx === undefined) {
                items[0].status = 'failed';
                ret = 3;
            } else {
                let signupUsers = await Subscriber.find({
                    address: items[0].address.toLowerCase(),
                    name: items[0].name,
                    email: items[0].email
                });
                if (signupUsers.length > 0) {
                    signupUsers[0].roles = items[0].roles;
                    let foundRole = await Role.findById(items[0].roles[0]);
                    if (foundRole.length > 0)
                        signupUsers[0].role = foundRole[0].name;

                    await Subscriber.findByIdAndUpdate(signupUsers[0]._id, signupUsers[0]);
                }
            }

            await Creator.findByIdAndUpdate(items[0]._id, items[0]);

            return ret;
        } else if (items[0].status === 'failed') {
            return 4;
        } else {
            return 1;
        }
    } else {
        return 2;
    }
}

module.exports = router;