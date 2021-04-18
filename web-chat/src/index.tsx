import multiaddr from 'multiaddr';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Waku from 'waku/waku';
import App from './App';
import reportWebVitals from './reportWebVitals';

declare var WAKU: Waku;

async function startWaku() {
  try {
    const waku = await Waku.create({});
    console.log('My peer id: ', waku.libp2p.peerId.toB58String());
    await waku.relay.subscribe();

    try {
      // TODO: Replace with fleet
      await waku.dial(multiaddr('/ip4/127.0.0.1/tcp/7777/ws/p2p/QmXGYLhkWVuE8PER8j2Xj3gLW2RZazJBo9kh8VSMHe7Cho'));
      WAKU = waku;
    } catch (e) {
      console.log('Error encountered dialing peer: ', e);
    }
  } catch (e) {
    console.log('Error encountered during Waku setup: ', e);
  }
}

(async () => {
  await startWaku();
})();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
