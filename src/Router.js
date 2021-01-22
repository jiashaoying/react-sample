import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import App from './App';
import StrategyHome from './pages/quant_strategy/Home';
import StrategyDetail from './pages/quant_strategy/Detail';

const BasicRoute = () => (
  <HashRouter>
    <Switch>
      <Route path="/" component={App} exact />
      <Route exact path="/quant_strategy/home" component={StrategyHome} />
      <Route exact path="/quant_strategy/detail/:id" component={StrategyDetail} />
    </Switch>
  </HashRouter>
);

export default BasicRoute;