import React, { useContext } from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import { UserContext } from '../store';
import { MODES, LOGIN_STATES } from '../constants/states';
import Header from '../components/Header';
import './index.css';
import HomePage from './HomePage';
import ForumPage from './ForumPage';
import LoginPage from './LoginPage';

const Navigator = () => {
  const user = useContext(UserContext);
  if (user.loginState !== LOGIN_STATES.LOGGED_IN_CUTOPIA) {
    return (
      <LoginPage />
    );
  }
  return (
    <Router>
      <div className="App">
        <Header />
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route exact path="/review">
            <ForumPage />
          </Route>
          <Route exact path="/review/:id">
            <ForumPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default Navigator;
