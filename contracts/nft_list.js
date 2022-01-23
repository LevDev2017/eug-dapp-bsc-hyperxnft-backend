// nft_list.js
const Web3 = require('web3')
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

web3.eth.getAccounts()
    .then(accounts => {accountAddress = accounts[0]})
    .catch(err => {
        console.log(err.toString());
    })


const reload_nft = async (collectionAddress, tokenId) => {
    let nftcollection = await new web3.eth.Contract(multipleCollectionContract, collectionAddress);

    let name = await nftcollection.methods.name().call();
    let symbol = await nftcollection.methods.symbol().call();

    let tokenURI = await nftcollection.methods.uri(tokenId).call();
    let creator = await nftcollection.methods.getCreator(tokenId).call();
    let tokenName = await nftcollection.methods.tokenName(tokenId).call();
    let tokenPrice = await nftcollection.methods.tokenPrice(tokenId).call();
    let tokenPaymentType = await nftcollection.methods.tokenPaymentType(tokenId).call();
    let tokenTransferCount = await nftcollection.methods.tokenTransferCount(tokenId).call();
    let tokenOnSale = await nftcollection.methods.tokenOnSale(tokenId).call();
    let tokenTitle = await nftcollection.methods.tokenTitle(tokenId).call();
    let tokenCategory = await nftcollection.methods.tokenCategory(tokenId).call();
    let tokenDescription = await nftcollection.methods.tokenDescription(tokenId).call();
    let tokenHashTags = await nftcollection.methods.tokenHashTags(tokenId).call();

    // console.log("");
    // console.log("name: ", name);
    // console.log("symbol: ", symbol);
    // console.log("tokenURI: ", tokenURI);
    // console.log("tokenName: ", tokenName);
    // console.log("tokenPrice: ", tokenPrice);
    // console.log("tokenPaymentType: ", tokenPaymentType);
    // console.log("tokenTransferCount: ", tokenTransferCount);
    // console.log("tokenOnSale: ", tokenOnSale);

    const newItem = {
        collectionName: name,
        symbol: symbol,
        contract: collectionAddress,
        tokenId: tokenId,
        URI: tokenURI,
        owner: owner,
        name: tokenName,
        price: tokenPrice,
        payment: parseInt(tokenPaymentType),
        transferCount: parseInt(tokenTransferCount),
        onSale: tokenOnSale,
        title: tokenTitle,
        category: tokenCategory,
        description: tokenDescription,
        hashtags: tokenHashTags
    };

    try {
        const items = await NFT.find({
            contract: collectionAddress,
            tokenId: tokenId
        });

        if (items.length > 0) { // if found an existing items
            if (items[0].collectionName != newItem.collectionName ||
                items[0].symbol != newItem.symbol ||
                items[0].contract != newItem.contract ||
                items[0].tokenId != newItem.tokenId ||
                items[0].URI != newItem.URI ||
                items[0].owner != newItem.owner ||
                items[0].name != newItem.name ||
                items[0].price != newItem.price ||
                items[0].payment != newItem.payment ||
                items[0].transferCount != newItem.transferCount ||
                items[0].onSale != newItem.onSale ||
                items[0].title != newItem.title ||
                items[0].category != newItem.category ||
                items[0].description != newItem.description ||
                items[0].hashtags != newItem.hashtags) { // update nft items
                await NFT.findByIdAndUpdate(
                    items[0]._id,
                    newItem,
                    {
                        returnDocument: 'after'
                    }
                )
                // console.log("updated items: ", newItem.contract, newItem.tokenId);
            } else {
                // console.log("no changes made: ", newItem.contract, newItem.tokenId);
            }
        } else {
            var newNFTDocument = new NFT(newItem);
            await newNFTDocument.save();

            // console.log("added: ", newItem.contract, newItem.tokenId);
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

            let collections = await contract.methods.getCollections().call({from: accountAddress});
            // console.log(collections);

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

                for (j = 1; j < reservedTokenId; j ++) {
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

const getTimeGap = (now, past) => {
    var span = now.getTime() - past.getTime();
    if (span < 0) {
        return "Time Error";
    }
    span /= 1000;
    if (span < 60) {
        return `${Math.floor(span)} seconds ago`;
    }
    span /= 60;
    if (span < 60) {
        return `${Math.floor(span)} minutes ago`;
    }
    span /= 60;
    if (span < 24) {
        return `${Math.floor(span)} hours ago`;
    }

    span /= 24;
    if (span < 30) {
        return `${Math.floor(span)} days ago`;
    }

    span /= 30;
    if (span < 12) {
        return `${Math.floor(span)} months ago`;
    }

    span /= 12;

    return `${Math.floor(span)} years ago`;
}

module.exports = { explorer_nfts, reload_nft, getTimeGap };
