import { useLazyQuery } from '@apollo/client';
import * as Sentry from '@sentry/react';
import { FC, useEffect } from 'react';
import { GET_USER } from '../../constants/queries';
import { useUser, useView } from '../../store';
import { User, LoginState } from '../../types';
import Loading from '../atoms/Loading';

type HOC = (Component: FC, options?: Record<any, any>) => FC;

const authenticatedRoute: HOC = (Component = null, options = {}) => {
  const AuthenticatedRoute: FC = props => {
    const user = useUser();
    const view = useView();
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
          } else {
            console.log(data);
            user.updateStore('loginState', LoginState.LOGGED_OUT);
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
      if (user.token && !user.data?.username) {
        getUser();
      }
    }, [user.token]);
    if (
      (userDataLoading || !user.data) &&
      user.loginState === LoginState.LOGGED_IN // i.e. not auth failed, instead of real logged in (real depending on if user.data exists)
    ) {
      return <Loading fixed padding={false} logo />;
    }
    return <Component {...props} {...options} />;
  };

  return AuthenticatedRoute;
};

export default authenticatedRoute;
