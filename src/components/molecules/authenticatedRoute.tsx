import { useLazyQuery } from '@apollo/client';
import * as Sentry from '@sentry/react';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { GET_USER } from '../../constants/queries';
import { useUser, useView } from '../../store';
import { User, AuthState } from '../../types';
import Loading from '../atoms/Loading';

type HOC = (Component: FC, options?: Record<any, any>) => FC;

const authenticatedRoute: HOC = (Component = null, options = {}) => {
  const AuthenticatedRoute: FC = props => {
    const [authState, setAuthState] = useState(AuthState.INIT);
    const user = useUser();
    const view = useView();
    const router = useRouter();
    const [getUser, { data: userData, loading: userDataLoading }] =
      useLazyQuery<{
        me: User;
      }>(GET_USER, {
        onCompleted: data => {
          if (data?.me?.username) {
            user.updateStore('data', data.me);
            Sentry.setUser({
              username: data.me.username,
            });
            setAuthState(AuthState.LOGGED_IN);
          } else {
            setAuthState(AuthState.LOGGED_OUT);
          }
        },
        onError: e => {
          const handled = view.handleError(e);
          setAuthState(AuthState.LOGGED_OUT);
        },
      });
    useEffect(() => {
      console.log(`Current user ${user.data}`);
      // If no prev login data, then redirect to login page
      if (!user.token) {
        setAuthState(AuthState.LOGGED_OUT);
        return;
      }
      // If logged in for current session, then return component
      if (user.data?.username) {
        setAuthState(AuthState.LOGGED_IN);
        return;
      }
      // If has prev token but not logged in, then check if token valid
      else {
        setAuthState(AuthState.LOADING);
        getUser();
        return;
      }
    }, [user.token]);

    useEffect(() => {
      user.updateStore('loginState', authState);
      if (authState === AuthState.LOGGED_OUT) {
        router.push({
          pathname: '/login',
          // query: { returnUrl: router.asPath },
        });
      }
    }, [authState]);

    return authState === AuthState.LOGGED_IN ? (
      <Component {...props} {...options} />
    ) : (
      <Loading fixed padding={false} logo />
    );
  };

  return AuthenticatedRoute;
};

export default authenticatedRoute;
