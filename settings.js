// TODO: flatten list of strategies with PMs for emailObj same way as forPurchase
module.exports = {
    // important settings
    sellAllStocksOnNthDay: 1,
    purchaseAmt: 70,
    forPurchase: [
        '[myTickerWatchers]'
    ],
    // forPurchaseVariation: '75Perc5Day-yesincludingblanks',
    fallbackSellStrategy: 'limit8',
    disableMultipliers: false,
    force: {
        sell: [
        ],
        keep: [
            'ACIU',
            'UEPS',
        ]
    }
};
