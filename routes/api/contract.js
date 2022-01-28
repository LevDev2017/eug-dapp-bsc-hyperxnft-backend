// routes/api/nft.js

const express = require('express');
const router = express.Router();

const ERC1155TradableABI = require('../../contracts/abi/ERC1155Tradable.json');
const FactoryABI = require('../../contracts/abi/HyperXNFTFactory.json');

const { NFT_FACTORY_CONTRACT_ADDRESS, ROUTER_V2_ADDRESS, HYPERX_CONTRACT, WBNB_CONTRACT, BUSD_CONTRACT } = require('../../contracts/address');

// @route POST api/nft
// @description nft prodecure from users
// @access public


router.get('/abi', async (req, res) => {
    const { name } = req.query;

    if (name === 'factory') {
        try {
            res.json({ result: 1, abi: FactoryABI.abi });
        } catch (err) {
            res.json({ result: 0, abi: [] });
        }
    } else if (name === 'multiplecollection') {
        try {
            res.json({ result: 1, abi: ERC1155TradableABI.abi });
        } catch (err) {
            res.json({ result: 0, abi: [] });
        }
    }
});

router.get('/address', async (req, res) => {
    const { name, token } = req.query;

    if (name === 'factory') {
        try {
            res.json({ result: 1, address: NFT_FACTORY_CONTRACT_ADDRESS });
        } catch (err) {
            res.json({ result: 0, address: '0x0000000000000000000000000000000000000000' });
        }
    } else if (name === 'token') {
        if (parseInt(token) === 1) {
            try {
                res.json({ result: 1, address: BUSD_CONTRACT });
            } catch (err) {
                res.json({ result: 0, address: '0x0000000000000000000000000000000000000000' });
            }
        } else if (parseInt(token) === 2) {
            try {
                res.json({ result: 1, address: HYPERX_CONTRACT });
            } catch (err) {
                res.json({ result: 0, address: '0x0000000000000000000000000000000000000000' });
            }
        }
    }
});

module.exports = router;
