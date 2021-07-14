import React, { useContext } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './index.css';
import SnackBar from '../components/SnackBar';
import { UserContext } from '../store';
import { LOGIN_STATES } from '../constants/states';
import Header from '../components/Header';
import HomePage from './HomePage';
import ForumPage from './ForumPage';
import LoginPage from './LoginPage';
import PlannerPage from './PlannerPage';

const Navigator = () => {
  const user = useContext(UserContext);
  if (user.loginState !== LOGIN_STATES.LOGGED_IN_CUTOPIA) {
    return (
      <>
        <SnackBar />
        <LoginPage />
      </>
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
          <Route
            exact
            path={[
              '/review',
              '/review/:id',
              '/review/:id/compose',
              '/review/:id/:reviewId',
            ]}
          >
            <ForumPage />
          </Route>
          <Route exact path="/planner">
            <PlannerPage />
          </Route>
          <Route exact path="/planner/:id">
            <PlannerPage />
          </Route>
        </Switch>
        <SnackBar />
      </div>
    </Router>
  );
};

export default Navigator;
