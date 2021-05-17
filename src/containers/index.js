import React from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import HomePage from './HomePage';

const Navigator = () => (
  <div className="App">
    <Router>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
      </Switch>
    </Router>
  </div>
);

export default Navigator;
