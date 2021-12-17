const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const ERC20 = require('./abi/erc20.json')
const chainData = require('./chainData')
const { HYPERX_CONTRACT, WBNB_CONTRACT, BUSD_CONTRACT, WBNB_BUSD_PAIR_CONTRACT, WBNB_HYPERX_PAIR_CONTRACT } = require('./address')

const models = require('../models');
const payment = models.payment;
const payment_conversion = models.payment_conversion;

const web3 = new Web3('https://speedy-nodes-nyc.moralis.io/7784d8edf9ba80a1d01a9c6c/bsc/mainnet');
// const web3 = new Web3(chainData.rpcUrls[0]);

const price_scan = async () => {

    let hyperx = await new web3.eth.Contract(ERC20, HYPERX_CONTRACT);
    let wbnb = await new web3.eth.Contract(ERC20, WBNB_CONTRACT);
    let busd = await new web3.eth.Contract(ERC20, BUSD_CONTRACT);

    let decimal = [
        {
            payment: 0,
            name: "HyperX",
            decimal: await hyperx.methods.decimals().call()
        },
        {
            payment: 1,
            name: "BNB",
            decimal: await wbnb.methods.decimals().call()
        },
        {
            payment: 2,
            name: "BUSD",
            decimal: await busd.methods.decimals().call()
        }
    ];

    let i;
    for (i = 0; i < decimal.length; i++) {
        try {
            var items = await payment.find(decimal[i]);
            if (items.length == 0) {
                var newDec = new payment(decimal[i]);
                await newDec.save();
            }
        } catch (err) {
            console.log(err);
        }
    }

    const reload_price = async () => {
        let bbpair_for_bnb = await wbnb.methods.balanceOf(WBNB_BUSD_PAIR_CONTRACT).call();
        let bbpair_for_busd = await busd.methods.balanceOf(WBNB_BUSD_PAIR_CONTRACT).call();

        let busd_to_bnb_price = await BigNumber(bbpair_for_busd).times(BigNumber(`1e${decimal[1].decimal}`)).div(BigNumber(bbpair_for_bnb)).div(BigNumber(`1e${decimal[2].decimal}`));

        let hbpair_for_hyper = await hyperx.methods.balanceOf(WBNB_HYPERX_PAIR_CONTRACT).call();
        let hbpair_for_bnb = await wbnb.methods.balanceOf(WBNB_HYPERX_PAIR_CONTRACT).call();

        let hbratio = await BigNumber(hbpair_for_bnb).times(BigNumber(`1e${decimal[0].decimal}`)).div(BigNumber(hbpair_for_hyper)).div(BigNumber(`1e${decimal[1].decimal}`));
        let busd_to_hyper_price = await hbratio.times(busd_to_bnb_price);

        var pc = [
            {
                name: "HyperX to BUSD",
                ratio: busd_to_hyper_price.toString()
            },
            {
                name: "BNB to BUSD",
                ratio: busd_to_bnb_price.toString()
            }
        ];

        let i;
        for (i = 0; i < pc.length; i ++) {
            try {
                var items = await payment_conversion.find({
                    name: pc[i].name
                });
                if (items.length > 0) {
                    await payment_conversion.findByIdAndUpdate(items[0]._id, pc[i]);
                } else {
                    var newPc = new payment_conversion(pc[i]);
                    await newPc.save();
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    const recursive_run = () => {
        reload_price()
            .then(() => {
                setTimeout(recursive_run, 1000);
            })
            .catch(err => {
                console.log("reload_price error: ", err);
                console.log("reload_price => running again");
                setTimeout(recursive_run, 1000);
            })
    }

    recursive_run();
}

module.exports = price_scan
