import { dev } from '$app/env'
import { SENTRY_DSN } from '$app/env/public'
import * as Sentry from '@sentry/sveltekit'

Sentry.init({
  dsn: SENTRY_DSN,

  enabled: !dev,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,
})

// or alternatively, if you don't have a custom error handler:
export const handleError = Sentry.handleErrorWithSentry()
