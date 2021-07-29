import { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './index.scss';
import { useLazyQuery } from '@apollo/client';
import SnackBar from '../components/molecules/SnackBar';
import { UserContext } from '../store';
import Header from '../components/organisms/Header';
import { LoginState, User } from '../types';
import { GET_USER } from '../constants/queries';
import Loading from '../components/atoms/Loading';
import HomePage from './HomePage';
import ForumPage from './ForumPage';
import LandingPage from './LandingPage';
import PlannerPage from './PlannerPage';

const Navigator = () => {
  const user = useContext(UserContext);
  const [getUser, { data: userData, loading: userDataLoading }] = useLazyQuery<{
    me: User;
  }>(GET_USER, {
    onCompleted: (data) => {
      if (data?.me?.username) {
        user.updateStore('data', data?.me);
      } else {
        console.log(data);
        user.updateStore('loginState', LoginState.LOGGED_OUT);
      }
    },
    onError: () => {
      user.updateStore('loginState', LoginState.LOGGED_OUT);
    },
  });
  useEffect(() => {
    if (user.token) {
      getUser();
    }
  }, [user.token]);
  if (user.loginState !== LoginState.LOGGED_IN_CUTOPIA) {
    return (
      <>
        <SnackBar />
        <LandingPage />
      </>
    );
  }
  if (userDataLoading) {
    return <Loading fixed />;
  }
  return (
    <Router>
      <div className="App">
        <Header />
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>
          <Route path="/review">
            <ForumPage />
          </Route>
          <Route exact path="/planner">
            <PlannerPage />
          </Route>
          <Route exact path="/planner/:id">
            <PlannerPage />
          </Route>
        </Switch>
      </div>
      <SnackBar />
    </Router>
  );
};

export default Navigator;
