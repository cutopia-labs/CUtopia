import { useLazyQuery } from '@apollo/client';
import * as Sentry from '@sentry/react';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { GET_USER } from '../../constants/queries';
import { useUser, useView } from '../../store';
import { User, LoginState } from '../../types';
import Loading from '../atoms/Loading';

type HOC = (Component: FC, options?: Record<any, any>) => FC;

enum AuthState {
  INIT,
  LOGGED_OUT,
  LOADING,
  LOGGED_IN,
}

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
            user.updateStore('loginState', LoginState.LOGGED_IN);
            setAuthState(AuthState.LOGGED_IN);
          } else {
            console.log(data);
            user.updateStore('loginState', LoginState.LOGGED_OUT);
            setAuthState(AuthState.LOGGED_OUT);
          }
        },
        onError: e => {
          const handled = view.handleError(e);
          if (!handled) {
            user.updateStore('loginState', LoginState.LOGGED_OUT);
          }
        },
      });
    useEffect(() => {
      console.log(`Current user ${user.data}`);
      if (!user.token) {
        setAuthState(AuthState.LOGGED_OUT);
        return;
      }
      if (!user.data?.username) {
        setAuthState(AuthState.LOADING);
        getUser();
        return;
      }
    }, [user.token]);

    useEffect(() => {
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
