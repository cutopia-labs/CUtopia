import { DocumentNode, useLazyQuery } from '@apollo/client';
import * as Sentry from '@sentry/nextjs';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { GET_USER } from '../../constants/queries';
import { useUser, useView } from '../../store';
import { User, AuthState } from '../../types';
import Loading from '../atoms/Loading';
import LoginPanel from '../templates/LoginPanel';

type Options = {
  userQuery?: DocumentNode;
};

type HOC = (Component: FC, options?: Options) => FC;

const authenticatedRoute: HOC = (Component = null, options = {}) => {
  const AuthenticatedRoute: FC = props => {
    const [authState, setAuthState] = useState(AuthState.INIT);
    const user = useUser();
    const view = useView();
    const router = useRouter();
    const [getUser] = useLazyQuery<{
      me: User;
    }>(options.userQuery || GET_USER, {
      onCompleted: data => {
        if (data?.me?.username) {
          user.updateUserData(data.me);
          Sentry.setUser({
            username: data.me.username,
          });
          setAuthState(AuthState.LOGGED_IN);
        } else {
          setAuthState(AuthState.LOGGED_OUT);
        }
      },
      onError: e => {
        view.handleError(e);
        setAuthState(AuthState.LOGGED_OUT);
      },
    });
    useEffect(() => {
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
        getUser();
        setAuthState(AuthState.LOADING);
        return;
      }
    }, [user.token]);

    useEffect(() => {
      user.updateStore('loginState', authState);
    }, [authState]);

    const renderContent = () => {
      switch (authState) {
        case AuthState.LOGGED_IN:
          return <Component {...props} />;
        case AuthState.LOGGED_OUT:
          return <LoginPanel returnUrl={router.asPath} />;
        default:
          return <Loading fixed padding={false} logo />;
      }
    };

    return renderContent();
  };

  return observer(AuthenticatedRoute);
};

export default authenticatedRoute;
