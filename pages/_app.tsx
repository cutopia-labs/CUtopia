import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import { FC, useMemo } from 'react';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@material-ui/core/styles';
import { Snackbar, useMediaQuery } from '@material-ui/core';

import StoreProvider from '../store';

import { DARK_THEME, THEME } from '../constants/colors';
import client from '../helpers/apollo-client';
import Header from '../components/organisms/Header';
import Dialog from '../components/templates/Dialog';

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => (prefersDarkMode ? DARK_THEME : THEME),
    [prefersDarkMode]
  );
  return (
    <StoreProvider>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <Header />
          <Component {...pageProps} />
          <Snackbar />
          <Dialog />
        </ThemeProvider>
      </ApolloProvider>
    </StoreProvider>
  );
};

export default MyApp;
