// nft_list.js

const Web3 = require('web3')
const chainData = require('./chainData')
const HyperXNFTManage = require('./abi/HyperXNFTManage.json')
const manager_contract = HyperXNFTManage.abi
const HyperXNFTCollection = require('./abi/HyperXNFTCollection.json')
const collection_contract = HyperXNFTCollection.abi
const { NFT_COLLECTION_MANAGER_CONTRACT } = require('./address')

const models = require('../models');
const NFT = models.NFT;

const web3 = new Web3(chainData.rpcUrls[0]);

const reload_nft = async (collectionAddress, tokenId) => {
    let nftcollection = await new web3.eth.Contract(collection_contract, collectionAddress);

    let name = await nftcollection.methods.name().call();
    let symbol = await nftcollection.methods.symbol().call();

    let tokenURI = await nftcollection.methods.tokenURI(tokenId).call();
    let owner = await nftcollection.methods.ownerOf(tokenId).call();
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

    const list_nft = async () => {
        let contract = await new web3.eth.Contract(manager_contract, NFT_COLLECTION_MANAGER_CONTRACT);

        let collections = await contract.methods.getCollectionInfo().call();

        let i;
        for (i = 0; i < collections.length; i++) {

            // await console.log("nfts: ", nfts);

            let nftcollection = await new web3.eth.Contract(collection_contract, collections[i]);
            let totalSupply = await nftcollection.methods.getNumberOfTokensMinted().call();

            let totalCount = await parseInt(totalSupply);

            let j;

            for (j = 0; j < totalCount; j++) {
                await reload_nft(collections[i], j);
            }
        }
    }

    const recursive_run = () => {
        list_nft()
            .then(() => {
                setTimeout(recursive_run, 1000);
            })
            .catch(err => {
                console.log("list_nft error: ", err);
                console.log("list_nft => running again");
                setTimeout(recursive_run, 1000);
            })
    }

    recursive_run();
}

module.exports = { explorer_nfts, reload_nft };
