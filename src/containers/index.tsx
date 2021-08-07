import { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { useLazyQuery } from '@apollo/client';
import { observer } from 'mobx-react-lite';

import './index.scss';
import SnackBar from '../components/molecules/SnackBar';
import { ViewContext, UserContext } from '../store';
import Header from '../components/organisms/Header';
import { ErrorCardMode, LoginState, User } from '../types';
import { GET_USER } from '../constants/queries';
import Loading from '../components/atoms/Loading';
import Dialog from '../components/templates/Dialog';
import ErrorCard from '../components/molecules/ErrorCard';
import HomePage from './HomePage';
import LandingPage from './LandingPage';
import PlannerPage from './PlannerPage';
import ForumPage from './ForumPage';
import AboutPage from './AboutPage';

const ROUTES = [
  {
    props: {
      exact: true,
      path: '/',
    },
    children: <HomePage />,
  },
  {
    props: {
      path: '/review',
    },
    children: <ForumPage />,
  },
  {
    props: {
      exact: true,
      path: ['/planner', '/planner/:courseId', '/planner/share/:shareId'],
    },
    children: <PlannerPage />,
  },
  {
    props: {
      exact: true,
      path: ['/about'],
    },
    children: <AboutPage />,
  },
  {
    props: {},
    children: <ErrorCard mode={ErrorCardMode.NOT_FOUND} />,
  },
];

const Navigator = () => {
  const user = useContext(UserContext);
  const view = useContext(ViewContext);
  const [getUser, { data: userData, loading: userDataLoading }] = useLazyQuery<{
    me: User;
  }>(GET_USER, {
    onCompleted: (data) => {
      if (data?.me?.username) {
        user.updateStore('data', data.me);
        Sentry.setUser({
          username: data.me.username,
        });
      } else {
        console.log(data);
        user.updateStore('loginState', LoginState.LOGGED_OUT);
      }
    },
    onError: (e) => {
      view.handleError(e);
      user.updateStore('loginState', LoginState.LOGGED_OUT);
    },
  });
  useEffect(() => {
    if (user.token && !user.data?.username) {
      getUser();
    }
  }, [user.token]);
  if (
    (userDataLoading || !user.data) &&
    user.loginState === LoginState.LOGGED_IN
  ) {
    return <Loading fixed />;
  }
  if (user.loginState !== LoginState.LOGGED_IN) {
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
          {ROUTES.map((route) => (
            <Route key={JSON.stringify(route.props.path)} {...route.props}>
              {route.children}
            </Route>
          ))}
        </Switch>
      </div>
      <SnackBar />
      <Dialog />
    </Router>
  );
};

export default observer(Navigator);
