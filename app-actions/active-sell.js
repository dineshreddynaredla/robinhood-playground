// starts attempting to sell at 100% of current stock price
// every attempt it goes down from there until it successfully gets sold or it reaches MIN_SELL_RATIO

const keepers = require('../keepers');

const limitSellLastTrade = require('../rh-actions/limit-sell-last-trade');
const jsonMgr = require('../utils/json-mgr');

const lookup = require('../utils/lookup');
const mapLimit = require('promise-map-limit');


const MIN_SELL_RATIO = 0.97; // before gives up
const TIME_BETWEEN_CHECK = 30; // seconds
const SELL_RATIO_INCREMENT = 0.005;


const addToDailyTransactions = async data => {
    const fileName = `./daily-transactions/${(new Date()).toLocaleDateString()}.json`;
    const curTransactions = await jsonMgr.get(fileName) || [];
    curTransactions.push(data);
    await jsonMgr.save(fileName, curTransactions);
};


module.exports = (Robinhood, { ticker, quantity }) => {

    return new Promise(async (resolve, reject) => {

        console.log(ticker, quantity, 'feafea')

        try {
            // if (keepers.includes(ticker)) {
            //     console.log('ticker on keeper list', ticker);
            //     return reject('ticker on keeper list');
            // }

            let curSellRatio = 1.0;
            let attemptCount = 0;

            const attempt = async () => {

                attemptCount++;

                console.log('attempt')
                const look = (await lookup(Robinhood, ticker));
                const curPrice = look.currentPrice;
                const bidPrice = curPrice * curSellRatio;
                console.log('attempting ', curSellRatio, ticker, bidPrice);
                const res = await limitSellLastTrade(
                    Robinhood,
                    {
                        ticker,
                        quantity,
                        bidPrice
                    }
                );

                if (res.detail)  {
                    // dont log transaction if failed
                    console.log('failed purchasing', ticker);
                    return reject(res.detail);
                }

                setTimeout(async () => {

                    // get orders, check if still pending
                    let {results: orders} = await Robinhood.orders();
                    orders = orders.filter(order => ['filled', 'cancelled'].indexOf(order.state) === -1);

                    orders = await mapLimit(orders, 1, async order => ({
                        ...order,
                        instrument: await Robinhood.url(order.instrument)
                    }));

                    const relOrder = orders.find(order => {
                        return order.instrument.symbol === ticker;
                    });
                    // console.log(relOrder);
                    if (relOrder) {
                        console.log('canceling last attempt', ticker);
                        await Robinhood.cancel_order(relOrder);
                        curSellRatio -= SELL_RATIO_INCREMENT;
                        if (curSellRatio > MIN_SELL_RATIO) {
                            return attempt();
                        } else {
                            const errMessage = 'reached MIN_SELL_RATIO, unable to sell';
                            console.log(errMessage, ticker);
                            reject(errMessage);
                        }
                    } else {

                        const successObj = {
                            type: 'sell',
                            ticker,
                            bid_price: bidPrice,
                            quantity
                        };
                        await addToDailyTransactions(successObj);

                        if (attemptCount) {
                            console.log('successfully sold with attemptcount', attemptCount, ticker);
                        }

                        return resolve(successObj);

                    }
                }, TIME_BETWEEN_CHECK * 1000);

            };

            attempt();

        } catch (e) {
            console.log(e);
            reject(e.toString());
        }


    });

};
