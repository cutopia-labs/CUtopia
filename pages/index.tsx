import React, { useContext, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import Head from 'next/head';
import Image from 'next/image';
import { useLazyQuery } from '@apollo/client';
import styles from '../styles/Home.module.scss';

import { SentryConfigs } from '../constants/configs';
import { ViewContext, UserContext } from '../store';
import { LoginState, User } from '../types';
import { GET_USER } from '../constants/queries';
import Loading from '../components/atoms/Loading';

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
    <div className={styles.container}>
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

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
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
