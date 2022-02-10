const Web3 = require('web3')
const HDWalletProvider = require("truffle-hdwallet-provider");
const BigNumber = require('bignumber.js')
const ERC20 = require('./abi/erc20.json')
const router_v2_abi = require('./abi/routerV2.json')
const fs = require('fs');
const chainData = require('./chainData')
const { ROUTER_V2_ADDRESS, BUSD_CONTRACT, HYPERX_CONTRACT } = require('./address')

const pvkey = fs.readFileSync('.secret').toString().trim();
const models = require('../models');
const payment = models.payment;
const payment_conversion = models.payment_conversion;

const provider = new HDWalletProvider(
    pvkey,
    // chainData.rpcUrls[0]
    // "https://data-seed-prebsc-1-s1.binance.org:8545" // testnet RPC
    // 'https://speedy-nodes-nyc.moralis.io/2e9dcc31990acc9b69974c3b/bsc/mainnet' // moralis mainnet RPC
    'https://bsc-dataseed.binance.org/' // mainnet RPC
);

const WBNB_CONTRACT_BSCMAINNET = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const HYPERX_CONTRACT_BSCMAINNET = '0x0469F8Ca65Ce318888cc0d6459d0c7cbe5912c98';
const BUSD_CONTRACT_BSCMAINNET = '0xe9e7cea3dedca5984780bafc599bd69add087d56';

const web3PriceScan = new Web3(provider);

var errString = '';

const price_scan = async () => {
    try {
        let router_v2 = await new web3PriceScan.eth.Contract(router_v2_abi, ROUTER_V2_ADDRESS);

        let hyperx = await new web3PriceScan.eth.Contract(ERC20.abi, HYPERX_CONTRACT_BSCMAINNET);
        let wbnb = await new web3PriceScan.eth.Contract(ERC20.abi, WBNB_CONTRACT_BSCMAINNET);
        let busd = await new web3PriceScan.eth.Contract(ERC20.abi, BUSD_CONTRACT_BSCMAINNET);

        let decimal = [
            {
                id: 0,
                name: "BNB",
                decimal: await wbnb.methods.decimals().call(),
                contract: '0x0000000000000000000000000000000000000000'
            },
            {
                id: 1,
                name: "BUSD",
                decimal: await busd.methods.decimals().call(),
                contract: BUSD_CONTRACT.toLowerCase()
            },
            {
                id: 2,
                name: "HyperX",
                decimal: await hyperx.methods.decimals().call(),
                contract: HYPERX_CONTRACT.toLowerCase()
            }
        ];

        let i;
        for (i = 0; i < decimal.length; i++) {
            var items = await payment.find({ id: decimal[i].id });
            if (items.length == 0) {
                var newDec = new payment(decimal[i]);
                await newDec.save();
            } else {
                await payment.findByIdAndUpdate(items[0]._id, decimal[i]);
            }
        }

        const reload_price = async () => {
            let BNB_unit_amount = BigNumber(`1e${decimal[0].decimal}`);
            let routerPairForBnb = [WBNB_CONTRACT_BSCMAINNET, BUSD_CONTRACT_BSCMAINNET];

            let bnb_price = await router_v2.methods.getAmountsOut(BNB_unit_amount, routerPairForBnb).call();
            let busd_to_bnb_price = BigNumber(bnb_price[1])
                .times(BigNumber(`1e${decimal[0].decimal}`))
                .div(BigNumber(bnb_price[0]))
                .div(BigNumber(`1e${decimal[1].decimal}`));

            let HYPER_unit_amount = BigNumber(`1e${decimal[2].decimal}`);
            let routerPairForHyper = [HYPERX_CONTRACT_BSCMAINNET, BUSD_CONTRACT_BSCMAINNET];

            let hyper_price = await router_v2.methods.getAmountsOut(HYPER_unit_amount, routerPairForHyper).call();
            let busd_to_hyper_price = BigNumber(hyper_price[1])
                .times(BigNumber(`1e${decimal[2].decimal}`))
                .div(BigNumber(hyper_price[0]))
                .div(BigNumber(`1e${decimal[1].decimal}`));

            var pc = [
                {
                    id: 0,
                    name: "BNB/BUSD",
                    ratio: busd_to_bnb_price.toString()
                },
                {
                    id: 1,
                    name: "BUSD/BUSD",
                    ratio: '1.0'
                },
                {
                    id: 2,
                    name: "HyperX/BUSD",
                    ratio: busd_to_hyper_price.toString()
                }
            ];

            console.log(pc);

            let i;
            for (i = 0; i < pc.length; i++) {
                var items = await payment_conversion.find({
                    name: pc[i].name
                });
                if (items.length > 0) {
                    await payment_conversion.findByIdAndUpdate(items[0]._id, pc[i]);
                } else {
                    var newPc = new payment_conversion(pc[i]);
                    await newPc.save();
                }
            }
        }

        const recursive_run = () => {
            reload_price()
                .then(() => {
                    errString = '';
                    setTimeout(recursive_run, 1000);
                })
                .catch(err => {
                    let errText = err.toString();
                    // if (errString != errText) {
                        console.log("reload_price: ", errText);
                        errString = errText;
                    // }
                    setTimeout(price_scan, 1000);
                })
        }

        recursive_run();
    } catch (err) {
        let errText = err.toString();
        // if (errString != errText) {
            console.log("price_scan: ", err);
            errString = errText;
        // }

        setTimeout(price_scan, 1000);
        return;
    }
}

module.exports = price_scan
