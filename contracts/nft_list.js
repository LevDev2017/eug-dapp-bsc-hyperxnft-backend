// nft_list.js
const Web3 = require('web3')
const axios = require('axios')
const HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require('fs');
const chainData = require('./chainData')
const HyperXNFTFactory = require('./abi/HyperXNFTFactory.json')
const factoryContract = HyperXNFTFactory.abi
const ERC721Tradable = require('./abi/ERC721Tradable.json')
const singleCollectionContract = ERC721Tradable.abi;
const ERC1155Tradable = require('./abi/ERC1155Tradable.json')
const multipleCollectionContract = ERC1155Tradable.abi;
const { addRawCollection } = require('../routes/api/collection');
const { NFT_FACTORY_CONTRACT_ADDRESS } = require('./address')

const models = require('../models');
const NFT = models.NFT;
const Favorite = models.favorite;
const Comment = models.comment;

const pvkey = fs.readFileSync('.secret').toString().trim();

const provider = new HDWalletProvider(
    pvkey,
    chainData.rpcUrls[0]
    // https://speedy-nodes-nyc.moralis.io/bfaf7a5a5cd9975318f411e4/bsc/testnet
    // "https://data-seed-prebsc-1-s1.binance.org:8545" // testnet RPC
    // 'https://speedy-nodes-nyc.moralis.io/2e9dcc31990acc9b69974c3b/bsc/mainnet' // moralis mainnet RPC
    // 'https://bsc-dataseed.binance.org/' // mainnet RPC
);
const web3 = new Web3(provider);
let accountAddress = '';

const axiosInst = axios.create();
axiosInst.defaults.timeout = 5000;


web3.eth.getAccounts()
    .then(accounts => { accountAddress = accounts[0] })
    .catch(err => {
        console.log(err.toString());
    })


const reload_nft = async (collectionAddress, tokenId) => {
    let nftcollection = await new web3.eth.Contract(multipleCollectionContract, collectionAddress);

    let tokenURI = await nftcollection.methods.uri(tokenId).call();
    let totalSupply = await nftcollection.methods.totalSupply(tokenId).call();
    let creator = await nftcollection.methods.getCreator(tokenId).call();
    let holderCount = await nftcollection.methods.holders(tokenId).call();

    let tokenInfo;
    try {
        let tx = await axiosInst.get(tokenURI);
        tokenInfo = tx.data;
    } catch (err) {
        console.log('reload_nft error: ', err.message, collectionAddress, tokenId);
        return;
    }

    let favoriteCount = await Favorite.find({
        collectionAddress: collectionAddress,
        tokenId: tokenId
    }).countDocuments();

    var commentCount = await Comment.find({
        collectionAddress: collectionAddress,
        tokenId: parseInt(tokenId)
    }).countDocuments();

    const newItem = {
        collectionAddress: collectionAddress,
        tokenId: tokenId,
        URI: tokenURI,
        totalSupply: totalSupply,
        creator: creator,
        holderCount: holderCount,
        image: tokenInfo.image,
        video: false,
        title: tokenInfo.name,
        category: tokenInfo.category,
        description: tokenInfo.description,
        attributes: JSON.stringify(tokenInfo.attributes),
        tags: JSON.stringify(tokenInfo.tags),
        favoriteCount: favoriteCount,
        commentCount: commentCount,
        timestamp: new Date()
    };

    try {
        const items = await NFT.find({
            collectionAddress: collectionAddress,
            tokenId: tokenId
        });

        if (items.length > 0) { // if found an existing items
            if (items[0].collectionAddress !== newItem.collectionAddress ||
                items[0].tokenId !== newItem.tokenId ||
                items[0].URI !== newItem.URI ||
                items[0].totalSupply !== newItem.totalSupply ||
                items[0].creator !== newItem.creator ||
                items[0].holderCount !== newItem.holderCount ||
                items[0].image !== newItem.image ||
                items[0].title !== newItem.title ||
                items[0].category !== newItem.category ||
                items[0].description !== newItem.description ||
                items[0].attributes !== newItem.attributes ||
                items[0].tags !== newItem.tags) { // update nft items
                if (items[0].video !== undefined) {
                    newItem.video = items[0].video;
                }
                await NFT.findByIdAndUpdate(
                    items[0]._id,
                    newItem,
                    {
                        returnDocument: 'after'
                    }
                )
                // console.log("updated items: ", newItem);
            }
            let i;
            for (i = 1; i < items.length; i++) {
                await NFT.findByIdAndRemove(items[i]._id)
            }
        } else {
            var newNFTDocument = new NFT(newItem);
            await newNFTDocument.save();

            // console.log("added: ", newItem);
        }
    } catch (err) {
        console.log(err);
    }
}

const explorer_nfts = async () => {

    let errString = '';

    const list_nft = async () => {
        try {
            let contract = await new web3.eth.Contract(factoryContract, NFT_FACTORY_CONTRACT_ADDRESS);

            let collections = await contract.methods.getCollections().call({ from: accountAddress });
            console.log(collections);

            let i;

            for (i = 0; i < collections.length; i++) {
                let nftcollection = await new web3.eth.Contract(multipleCollectionContract, collections[i]);
                let owner = await nftcollection.methods.owner().call();

                // add this collectiona address if it does not exist in db.
                await addRawCollection(collections[i], owner);
            }

            for (i = 0; i < collections.length; i++) {
                let nftcollection = await new web3.eth.Contract(multipleCollectionContract, collections[i]);
                let reservedTokenId = parseInt(await nftcollection.methods.getReservedTokenId().call());

                let j;

                for (j = 1; j < reservedTokenId; j++) {
                    await reload_nft(collections[i], j);
                }
            }
            errString = '';
        } catch (err) {
            let errText = err.toString();
            if (errString != errText) {
                errString = errText;
                console.log("list nft: ", errText);
            }
        }
    }

    const recursive_run = () => {
        list_nft()
            .then(() => {
                setTimeout(recursive_run, 1000);
            })
            .catch(err => {
                setTimeout(recursive_run, 1000);
            });
    }

    recursive_run();
}

module.exports = { explorer_nfts, reload_nft };
