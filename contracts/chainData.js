const chainData =
{
    // chainId: '0x38',
    // networkName: 'Binance Smart Chain',
    // nativeCurrency: {
    //     name: 'BNB',
    //     symbol: 'BNB',
    //     decimals: 18
    // },
    // rpcUrls: ['https://speedy-nodes-nyc.moralis.io/7784d8edf9ba80a1d01a9c6c/bsc/mainnet'],
    // blockUrls: ['https://bscscan.com/']

    // chainId: '0x539',
    // networkName: 'ganache-local-node',
    // nativeCurrency: {
    //     name: 'ETH',
    //     symbol: 'ETH',
    //     decimals: 18
    // },
    // rpcUrls: ['http://127.0.0.1:7545/'],
    // blockUrls: [''],

    chainId: '0x61',
    networkName: 'bsc testnet',
    nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
    },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    blockUrls: ['https://testnet.bscscan.com/']
}

module.exports = chainData;
