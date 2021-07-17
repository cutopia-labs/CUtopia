import { useContext, useEffect, useMemo, useState } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { observer } from 'mobx-react-lite';
import { ThemeProvider } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';

import StoreProvider, { UserContext, PreferenceContext } from './store';

import Navigator from './containers';
import { DARK_THEME, THEME } from './constants/colors';
import { LoginState } from './types';

const AppWrapper = observer(() => {
  const [ready, setReady] = useState(false);
  const preference = useContext(PreferenceContext);
  const user = useContext(UserContext);

  const init = async () => {
    await user.init();
    await preference.init();
    setReady(true);
  };

  useEffect(() => {
    init();
  }, []);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => (prefersDarkMode ? DARK_THEME : THEME),
    [prefersDarkMode]
  );

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
      onError: (e) => {
        console.log(e);
      },
    });
  }, [user.token]);

  if (user.loginState !== undefined) {
    console.log(
      user.loginState === LoginState.LOGGED_IN_CUTOPIA
        ? 'Logged in'
        : 'Not Logged in'
    );
  }

  if (!ready) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <Navigator />
      </ThemeProvider>
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
