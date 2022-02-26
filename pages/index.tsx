import React, { useContext, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import Head from 'next/head';
import { useLazyQuery } from '@apollo/client';
import { enableStaticRendering } from 'mobx-react-lite';
import styles from '../styles/Home.module.scss';

import { SentryConfigs } from '../constants/configs';
import { ViewContext, UserContext } from '../store';
import { LoginState, User } from '../types';
import { GET_USER } from '../constants/queries';
import Loading from '../components/atoms/Loading';
import HomePage from './HomePage';

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.table = () => {};
}

Sentry.init({
  ...SentryConfigs,
  integrations: [new Integrations.BrowserTracing()],
  /* Temp disable cuz it showed multiple
  beforeSend(event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({ eventId: event.event_id });
    }
    return event;
  },
  */
});

enableStaticRendering(typeof window === 'undefined');

export default function Home() {
  const user = useContext(UserContext);
  const view = useContext(ViewContext);
  const [getUser, { data: userData, loading: userDataLoading }] = useLazyQuery<{
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
    if (user.token && !user.data?.username) {
      getUser();
    }
  }, [user.token]);
  if (
    (userDataLoading || !user.data) &&
    user.loginState === LoginState.LOGGED_IN
  ) {
    return <Loading fixed padding={false} logo />;
  }
  return (
    <div className={styles.App}>
      <Head>
        <link rel="icon" href="%PUBLIC_URL%/cutopia-logo.png" />
        <title>CUtopia</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="CUtopia is a course review and planning platform for CUHK students."
        />
        <link rel="apple-touch-icon" href="%PUBLIC_URL%/cutopia-logo.png" />
        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href={`https://fonts.googleapis.com/css2?family=Pacifico&display=swap`}
          rel="stylesheet"
        />
      </Head>
      <HomePage />
    </div>
  );
}

/*
ReactDOM.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={<ErrorCard mode={ErrorCardMode.ERROR} />}
      showDialog
    >
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
*/

// reportWebVitals(console.log);
