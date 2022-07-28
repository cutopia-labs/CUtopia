import * as Sentry from '@sentry/nextjs';
import { Integrations } from '@sentry/tracing';

// use sentry to catch exceptions
Sentry.init({
  dsn:
    process.env.NODE_ENV !== 'production'
      ? 'https://c38359448a5448a58971eeb211568473@o861810.ingest.sentry.io/5821571'
      : '',
  tracesSampleRate: 0.3,
  integrations: [new Integrations.BrowserTracing()],
});
