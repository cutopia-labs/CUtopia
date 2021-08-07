import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import './index.scss';
import App from './App';
import { SentryConfigs } from './constants/configs';
import ErrorCard from './components/molecules/ErrorCard';
import { ErrorCardMode } from './types';

Sentry.init({
  ...SentryConfigs,
  integrations: [new Integrations.BrowserTracing()],
  beforeSend(event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({ eventId: event.event_id });
    }
    return event;
  },
});

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

// reportWebVitals(console.log);
