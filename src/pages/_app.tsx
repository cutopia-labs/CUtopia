import type { AppProps } from 'next/app';
import { FC, useEffect, useMemo } from 'react';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';
import { Integrations } from '@sentry/tracing';
import * as Sentry from '@sentry/react';
import NProgress from 'nprogress';
import { useRouter } from 'next/router';

import '../styles/globals.scss';
import StoreProvider from '../store';
import { DARK_THEME, THEME } from '../constants/colors';
import client from '../helpers/apollo-client';
import Header from '../components/organisms/Header';
import Dialog from '../components/templates/Dialog';
import SnackBar from '../components/molecules/SnackBar';
import { SentryConfigs } from '../constants/configs';

// clear all console output
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.table = () => {};
}

// use sentry to catch exceptions
Sentry.init({
  ...SentryConfigs,
  integrations: [new Integrations.BrowserTracing()],
});

NProgress.configure({
  trickleSpeed: 100,
  showSpinner: false,
});

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => (prefersDarkMode ? DARK_THEME : THEME),
    [prefersDarkMode]
  );
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeStart', () => NProgress.start());
    router.events.on('routeChangeComplete', () => NProgress.done());
    router.events.on('routeChangeError', () => NProgress.done());
  }, []);
  return (
    <StoreProvider>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <Header />
          <Component {...pageProps} />
          <SnackBar />
          <Dialog />
        </ThemeProvider>
      </ApolloProvider>
    </StoreProvider>
  );
};

export default MyApp;
