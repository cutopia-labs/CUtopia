import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
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

import StoreProvider, { UserContext, PlannerContext } from '../store';

import { DARK_THEME, THEME } from '../constants/colors';
import { SERVER_CONFIG } from '../constants/configs';

const AppWrapper = observer(() => {
  const [ready, setReady] = useState(false);
  const user = useContext(UserContext);
  const planner = useContext(PlannerContext);

  const init = async () => {
    await Promise.all([user.init(), planner.init()]);
    console.log('Ready');
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
      uri: SERVER_CONFIG.URI,
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
      cache: new InMemoryCache({
        addTypename: false,
      }),
    });
  }, [user.token]);

  if (!ready) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <Fragment></Fragment>
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
