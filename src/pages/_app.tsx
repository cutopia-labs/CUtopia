import type { AppProps } from 'next/app';
import { FC, useEffect, useMemo } from 'react';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';
import * as Sentry from '@sentry/nextjs';
import NProgress from 'nprogress';
import { useRouter } from 'next/router';

import '../styles/globals.scss';
import Script from 'next/script';
import StoreProvider from '../store';
import { DARK_THEME, THEME } from '../constants/colors';
import client from '../helpers/apollo-client';
import Header from '../components/organisms/Header';
import Dialog from '../components/templates/Dialog';
import SnackBar from '../components/molecules/SnackBar';
import ErrorCard from '../components/molecules/ErrorCard';
import { ErrorCardMode } from '../types';
import HeadSeo from '../components/atoms/HeadSeo';

// clear all console output
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.table = () => {};
}

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
    <>
      <HeadSeo pageProps={pageProps} />
      <Sentry.ErrorBoundary fallback={<ErrorCard mode={ErrorCardMode.ERROR} />}>
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
      </Sentry.ErrorBoundary>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-C85DMTM94G"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-C85DMTM94G');
        `}
      </Script>
    </>
  );
};

export default MyApp;
