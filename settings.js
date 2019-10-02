// TODO: flatten list of strategies with PMs for emailObj same way as forPurchase

let expectedPickCount = 0;
const pm = (str, multiplier = 1, groupName) => {

    let totalCount = 0;
    const lines = str.split('\n').map(line => line.trim()).filter(Boolean);
    const onlyPms = lines.map(line => {
        const [pm, count] = line.split(' ');
        totalCount += Number(count || 1);
        return pm;
    });
    const withMultiplier = totalCount * multiplier;
    console.log({
        groupName,
        totalCount,
        withMultiplier
    });
    expectedPickCount += withMultiplier;
    return Array(multiplier).fill(onlyPms).flatten().map(pm => `[${pm}]`);
};


module.exports = {
    // important settings
    sellAllStocksOnNthDay: 8,
    purchaseAmt: 120,
    forPurchase: [

        // 2/5 sudden drops - TOTAL 42


        ...pm(`
            avg-downer 3
            avg-downer 3
            sudden-drops-notWatchout-initial 30
            sudden-drops-notWatchout-brunch 14
            sudden-drops-notWatchout-brunch 14
            sudden-drops-notWatchout-lunch 8
            sudden-drops-notWatchout-lunch 8
            sudden-drops-notWatchout-lunch 8
            sudden-drops-notWatchout-dinner 2
            sudden-drops-notWatchout-dinner 2
            sudden-drops-notWatchout-dinner 2
            sudden-drops-notWatchout-dinner 2
            sudden-drops-notWatchout-majorJump 5
            sudden-drops-notWatchout-majorJump 5
            sudden-drops-notWatchout-majorJump 5
            sudden-drops-notWatchout-lunch 4
            sudden-drops-notWatchout-lunch 4
        `, 1, 'general sudden-drops'),  // 17


        ...pm(`
            pennyscan-nowheres-singleTopVolumeSS-initial 1
            pennyscan-nowheres-singleTopVolumeSS-initial 1
            rsi-10min-rsilt10 4
            rsi-shouldWatchout-firstAlert-rsilt15 6
            rsi-10min-firstAlert-rsilt10-brunch 2
            overnight-drops-majorJump 4
            rsi-10min-notWatchout-firstAlert-rsilt10-brunch 2
        `, 1, 'turnt')

    ],
    // forPurchaseVariation: '75Perc5Day-yesincludingblanks',
    // fallbackSellStrategy: 'limit8',
    disableMultipliers: false,
    force: {
        sell: [
        ],
        keep: [
            'ACIU',
            'UEPS',
            'MNGA'
        ]
    },
    expectedPickCount
};
