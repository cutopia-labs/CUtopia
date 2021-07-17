import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import './index.css';
import App from './App';
import { SENTRY_SAMPLING_RATE } from './constants/configs';

Sentry.init({
  dsn: 'https://c38359448a5448a58971eeb211568473@o861810.ingest.sentry.io/5821571',
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: SENTRY_SAMPLING_RATE,
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// reportWebVitals(console.log);
