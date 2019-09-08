const breakdowns = picks => {
  const singleTopVolumeSS = picks
    .sort((a, b) => b.projectedVolume - a.projectedVolume)
    .slice(0, 10)
    .sort((a, b) => b.stSent - a.stSent)
    .slice(0, 1);
  const singlePercMaxVolSS = picks
    .sort((a, b) => b.percMaxVol - a.percMaxVol)
    .slice(0, 8)
    .sort((a, b) => b.stSent - a.stSent)
    .slice(0, 1);
  const highestTrend = picks
    .sort((a, b) => b.highestTrend - a.highestTrend)
    .slice(0, 1);
  const singleTopDollarVolume = picks
    .sort((a, b) => b.dollarVolume - a.dollarVolume)
    .slice(0, 1);
  const singleTopProjectedVolume = picks
    .sort((a, b) => b.projectedVolume	 - a.projectedVolume)
    .slice(0, 1);
  const ss180 = picks
    .sort((a, b) => b.stSent - a.stSent)
    .filter(pick => pick.stSent >= 180);
  const topSS = picks
    .sort((a, b) => b.stSent - a.stSent)
    .slice(0, 1);
  const ssFirstTwo = picks
    .sort((a, b) => b.stSent - a.stSent)
    .slice(0, 2);
  const stTrendRatioFirst3 = picks
    .sort((a, b) => b.stTrendRatio - a.stTrendRatio)
    .slice(0, 3);
  const worstSsTrendRatio = picks
    .sort((a, b) => a.stTrendRatio - b.stTrendRatio)
    .slice(0, 2);
  const worstSS = picks
    .sort((a, b) => a.stSent - b.stSent)
    .slice(0, 2);
  const zScoreInverseTrend = picks
    .sort((a, b) => b.zScoreInverseTrend - a.zScoreInverseTrend)
    .slice(0, 1);
  const zScoreVolume = picks
    .sort((a, b) => b.zScoreVolume - a.zScoreVolume)
    .slice(0, 1);
  const zScoreSum = picks
    .sort((a, b) => b.zScoreSum - a.zScoreSum)
    .slice(0, 1);
  const zScoreInverseTrendPlusVol = picks
    .sort((a, b) => b.zScoreInverseTrendPlusVol - a.zScoreInverseTrendPlusVol)
    .slice(0, 1);
  const zScoreInverseTrendPlusVolTwo = picks
    .sort((a, b) => b.zScoreInverseTrendPlusVol - a.zScoreInverseTrendPlusVol)
    .slice(0, 2);
  return {
    singleTopVolumeSS,
    singlePercMaxVolSS,
    singleTopDollarVolume,
    singleTopProjectedVolume,
    ss180,
    topSS,
    ssFirstTwo,
    stTrendRatioFirst3,
    worstSsTrendRatio,
    worstSS,
    highestTrend,
    zScoreInverseTrend,
    zScoreVolume,
    zScoreSum,
    zScoreInverseTrendPlusVol,
    zScoreInverseTrendPlusVolTwo
  };
};

const scans = [
  'nowheres',
  'hot-st',
  'droppers',
  'unfiltered',
];

module.exports = async () => {

  const picks = [];
  for (let scan of scans) {
    const scanFn = require(`../penny-scans/${scan}`);
    console.log('running ', scan, 'PENNY SCAN');
    const response = await scanFn();
    const brokenDown = breakdowns(response);
    Object.keys(brokenDown).forEach(subset => {

      brokenDown[subset].forEach(pick => {
        const { ticker, ...rest } = pick;
        picks.push({
          ticker,
          strategyName: 'pennyscan',
          keys: {
            [scan]: true,
            [subset]: true
          },
          data: rest
        });
      });

    });

  }


  // volume increasing scans 
  const volIncreasing = [
    'volume-increasing-5min', 
    'volume-increasing-10min'
  ];

  for (let scan of volIncreasing) {
    const scanFn = require(`../penny-scans/${scan}`);
    console.log('running ', scan, 'PENNY SCAN');
    const response = await scanFn();
    response.forEach(pick => {
      const { ticker, ...rest } = pick;
      const { stSent } = rest;
      // if (stSent > 80) {
        picks.push({
          ticker,
          strategyName: 'pennyscan',
          keys: {
            [scan]: true,
          },
          data: rest
        });
      // }
    });
  }


  return picks;

};