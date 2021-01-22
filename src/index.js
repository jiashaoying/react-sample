import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import reportWebVitals from './reportWebVitals';
import Router from './Router';

ReactDOM.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
