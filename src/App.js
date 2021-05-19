import React, { useContext, useMemo } from 'react';
import {
  ApolloClient, InMemoryCache, ApolloProvider, createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { observer } from 'mobx-react-lite';

import StoreProvider, { UserContext, PreferenceContext } from './store';

import { LOGIN_STATES } from './constants/states';
import Navigator from './containers';

const AppWrapper = observer(() => {
  const preference = useContext(PreferenceContext);
  const user = useContext(UserContext);
  const client = useMemo(() => {
    const httpLink = createHttpLink({
      uri: 'https://uqtx8qgnz5.execute-api.ap-northeast-1.amazonaws.com/Stage/graphql',
    });
    const authLink = setContext((_, { headers }) => {
      const { token } = user;
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });
    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    });
  }, [user.token]);

  if (user.loginState !== undefined) {
    console.log(user.loginState === LOGIN_STATES.LOGGED_IN_CUTOPIA ? 'Logged in' : 'Not Logged in');
  }

  return (
    <ApolloProvider client={client}>
      <Navigator />
    </ApolloProvider>
  );
});

export default function App() {
  return (
    <StoreProvider>
      <AppWrapper />
    </StoreProvider>
  );
}
