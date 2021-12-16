// db.js

const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(
            db,
            {
                useNewUrlParser: true, 
                useUnifiedTopology: true
            }
        );

        console.log('MongoDB is Connected...');
        await initial();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const models = require('../models')
const Role = models.role;
const Subscriber = models.subscriber;
const Creator = models.creator;

async function initial() {
    const count = await Role.estimatedDocumentCount();

    if (count == 0) {
        var ret = new Role({
            name: models.ROLES[0]
        });
        await ret.save();

        ret = new Role({
            name: models.ROLES[1]
        });
        await ret.save();

        ret = new Role({
            name: models.ROLES[2]
        });
        await ret.save();
    }

    const adminRole = await Role.find({ name: models.ROLES[2] }).limit(1);
    const creatorRole = await Role.find({ name: models.ROLES[1] }).limit(1);

    var creators = [
        {
            name: "Josh",
            email: "Josh@gmail.com",
            password: "JoshPassword",
            roles: [adminRole[0]._id]
        },
        {
            email: "Jack@gmail.com",
            name: "Jack",
            password: "JackPassword",
            roles: [creatorRole[0]._id]
        },
        {
            email: "Tony@gmail.com",
            name: "Tony",
            password: "TonyPassword",
            roles: [creatorRole[0]._id]
        },
        {
            email: "Anna@gmail.com",
            name: "Anna",
            password: "AnnaPassword",
            roles: [creatorRole[0]._id]
        }
    ];

    await creators.forEach ( async (item, index) => {
        var ret = await Creator.find(item);
        if (ret === undefined || ret.length == 0) {
            ret = new Creator({
                name: item.name,
                email: item.email,
                password: item.password,
                roles: [item.roles[0]]
            });
            await ret.save();
        }
    })

    // creators.forEach ( async (item, index) => {
    //     var ret = await Subscriber.find( {
    //         email: item.email,
    //         name: item.name,
    //         password: item.password
    //     });
    //     if (ret === undefined || ret.length == 0) {
    //         ret = new Subscriber({
    //             name: item.name,
    //             email: item.email,
    //             password: item.password,
    //             address: "",
    //             roles: [item.roles[0]]
    //         });
    //         await ret.save();
    //     }
    // })
}

module.exports = connectDB;
