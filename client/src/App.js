import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import socketIOClient from "socket.io-client";

import getTrend from './utils/get-trend';
import avgArray from './utils/avg-array';

const trendPerc = num => (
    <span className={ num > 0 ? 'positive' : 'negative'}>
        {num.toFixed(2)}%
    </span>
);

class Pick extends Component {
  state = {
      showingDetails: false
  };
  toggleDetails = () => {
      console.log('toggle!');
      this.setState({ showingDetails: !this.state.showingDetails })
  };
  render() {
      const { showingDetails } = this.state;
      const { pick } = this.props;
      return (
          <div className="pick">
              <button onClick={this.toggleDetails}>
                  {showingDetails ? '-' : '+'}
              </button>
              <b>{trendPerc(pick.avgTrend)}</b>
              <strong>{' ' + pick.stratMin}</strong>
              {
                showingDetails && (
                    <table>
                        <thead>
                            <th>ticker</th>
                            <th>thenPrice</th>
                            <th>nowPrice</th>
                            <th>trend</th>
                        </thead>
                        <tbody>
                            {
                                pick.withTrend.map(tickerObj => (
                                    <tr>
                                        <td>{tickerObj.ticker}</td>
                                        <td>{tickerObj.thenPrice}</td>
                                        <td>{tickerObj.nowPrice}</td>
                                        <td>{tickerObj.trend}%</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                )
              }

          </div>
      );
  }
}

class App extends Component {
  state = { picks: [], relatedPrices: {}, vipStrategiesOnly: true };
  componentDidMount() {
      const { protocol, hostname } = window.location;
      let endpoint = `${protocol}//${hostname}`;
      if (hostname === 'localhost') {
          endpoint += ':3000';
      }
      const socket = socketIOClient(endpoint);
      socket.on('server:picks-data', data => {
          console.log(data);
          this.setState({
              picks: [data].concat(this.state.picks)
          });
      });
      socket.on('server:welcome', data => {
          this.setState(data);
      });
      socket.on('server:related-prices', data => {
          this.setState({ relatedPrices: data });
      });
  }
  toggleVipStrategies = () => {
      this.setState({
          vipStrategiesOnly: !this.state.vipStrategiesOnly
      });
  }
  render() {
      let { picks, relatedPrices, vipStrategies, vipStrategiesOnly } = this.state;
      if (!vipStrategies) return <h1 style={{ textAlign: 'center' }}>loading</h1>;
      picks = picks.map(pick => {
          const calcedTrend = pick.withPrices.map(({ ticker, price }) => ({
              ticker,
              thenPrice: price,
              nowPrice: relatedPrices[ticker],
              trend: getTrend(relatedPrices[ticker], price)
          }));
          return {
              ...pick,
              avgTrend: avgArray(calcedTrend.map(t => t.trend)),
              withTrend: calcedTrend
          };
      });
      let sortedByAvgTrend = picks.sort((a, b) => Number(b.avgTrend) - Number(a.avgTrend));
      if (vipStrategiesOnly) {
          sortedByAvgTrend = sortedByAvgTrend.filter(strat => vipStrategies.includes(strat.stratMin));
      }
      console.log('rendering!');
      const avgTrendOverall = avgArray(sortedByAvgTrend.map(strat => strat.avgTrend).filter(val => !!val));
      return (
          <div className="App">
              <header className="App-header">
                  <h1 className="App-title">robinhood-playground</h1>
                  <input
                      type="checkbox"
                      id="vipStrategies"
                      checked={vipStrategiesOnly}
                      onChange={this.toggleVipStrategies}
                  />
                  <label htmlFor="vipStrategies">
                      VIP Strategies Only
                  </label>
              </header>
              <p>
                  <h2>overall average trend: {trendPerc(avgTrendOverall)}</h2>
              </p>
              <p className="App-intro">
                  {
                    sortedByAvgTrend.map(pick => (
                        <Pick pick={pick} key={pick.stratMin} />
                    ))
                  }
              </p>
          </div>
      );
  }
}

export default App;
