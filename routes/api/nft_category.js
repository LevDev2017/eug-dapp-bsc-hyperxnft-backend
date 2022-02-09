// routes/api/nft_category.js

const express = require('express');
const router = express.Router();
const models = require('../../models');

const NFTCategory = models.NFT_category;

// @route GET api/nft_category
// @description nft category prodecure from users
// @access public

router.get('/', async (req, res) => {
    try {
        if (req.query.address !== undefined) {
            let creatorCategories = await NFTCategory.find({
                creator: req.query.address.toLowerCase()
            })

            if (creatorCategories.length === 0) { // if default category is needed
                creatorCategories = await NFTCategory.find({
                    creator: ''
                })
            }

            res.json({ msg: 'found', result: 1, categories: creatorCategories });
        } else if (req.query.all !== undefined) {
            let creatorCategories = await NFTCategory.find()

            res.json({ msg: 'found', result: 1, categories: creatorCategories });
        }
    } catch (err) {
        console.log(`${err.message}`);
        res.json({ msg: err.message, result: 0 });
    }
})

const addDefaultNFTCategories = async () => {
    let categories = [
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Weapon', depth3: 'Rifle', depth4: 'Big' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Weapon', depth3: 'Rifle', depth4: 'Small' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Weapon', depth3: 'Rifle', depth4: 'Medium' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Weapon', depth3: 'Gun', depth4: 'Silver' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Weapon', depth3: 'Gun', depth4: 'Dark' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Weapon', depth3: 'Gun', depth4: 'Tiny' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Shoes', depth3: 'Canvas', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Shoes', depth3: 'Police', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Shoes', depth3: 'Guerilla', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Helmet', depth3: 'USA', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Helmet', depth3: 'ENG', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Diosito X', depth2: 'Helmet', depth3: 'GER', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Paccy', depth2: 'C1', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Paccy', depth2: 'C2', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Paccy', depth2: 'C3', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Meta Squid', depth2: 'M1', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Meta Squid', depth2: 'M2', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Hyper Heroes', depth2: 'H1', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Hyper Heroes', depth2: 'H2', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Hyper Heroes', depth2: 'H3', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Racing Dots', depth2: '', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Games', depth1: 'Block Dox', depth2: '', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Influencers', depth2: 'I1', depth3: 'A1', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Influencers', depth2: 'I1', depth3: 'A2', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Influencers', depth2: 'I1', depth3: 'A3', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Influencers', depth2: 'I1', depth3: 'A4', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Influencers', depth2: 'I2', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Influencers', depth2: 'I3', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Influencers', depth2: 'I4', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Influencers', depth2: 'I5', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Sporters', depth2: 'FootBall', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Sporters', depth2: 'BasketBall', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Sporters', depth2: 'BaseBall', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Sporters', depth2: 'VolleyBall', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Sporters', depth2: 'Table Tennis', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'ESporters', depth2: 'Racing', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'ESporters', depth2: 'Gambling', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'ESporters', depth2: 'Intellectual', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'ESporters', depth2: 'Sense', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Team Hyper', depth2: '', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Artist', depth2: 'Painter', depth3: 'Old', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Artist', depth2: 'Painter', depth3: 'Young', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Artist', depth2: 'Painter', depth3: 'Children', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Artist', depth2: 'Photographer', depth3: 'Landscape', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Artist', depth2: 'Photographer', depth3: 'Album', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Artist', depth2: 'Carver', depth3: '', depth4: '' },
        { creator: '', creatorName: '', depth0: 'Art', depth1: 'Artist', depth2: 'Fine Artist', depth3: '', depth4: '' },
    ];

    console.log(`Adding ${categories.length} NFT categories...`);

    let i;
    for (i = 0; i < categories.length; i++) {
        let tt = await NFTCategory.find(categories[i]);
        if (tt.length === 0) {
            let ret = new NFTCategory(categories[i]);
            await ret.save();
        } else {
            await NFTCategory.findByIdAndUpdate(tt[0]._id, categories[i]);
        }
    }
}

module.exports = router;
module.exports.addDefaultNFTCategories = addDefaultNFTCategories;
