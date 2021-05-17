import React from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import Header from '../components/Header';
import './index.css';
import HomePage from './HomePage';
import ForumPage from './ForumPage';

const Navigator = () => (
  <Router>
    <div className="App">
      <Header />
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route exact path="/forum">
          <ForumPage />
        </Route>
        <Route exact path="/forum/:id">
          <ForumPage />
        </Route>
      </Switch>
    </div>
  </Router>
);

export default Navigator;
