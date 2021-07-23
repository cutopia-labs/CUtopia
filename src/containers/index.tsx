import { useContext } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './index.scss';
import SnackBar from '../components/molecules/SnackBar';
import { UserContext } from '../store';
import Header from '../components/organisms/Header';
import HomePage from './HomePage';
import ForumPage from './ForumPage';
import LandingPage from './LandingPage';
import PlannerPage from './PlannerPage';
import { LoginState } from '../types';

const Navigator = () => {
  const user = useContext(UserContext);
  if (user.loginState !== LoginState.LOGGED_IN_CUTOPIA) {
    return (
      <>
        <SnackBar />
        <LandingPage />
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
