import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { App } from './App';

import store from './redux/store';

import './index.css';
// import { getPlaces } from './services/firestore';

// (async () => {
//   console.log(await getPlaces());
// })();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
