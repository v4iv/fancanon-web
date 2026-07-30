import { SENTRY_DSN } from '$app/env/public'
import * as Sentry from '@sentry/sveltekit'

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: false,
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
})

// or alternatively, if you don't have a custom error handler:
export const handleError = Sentry.handleErrorWithSentry()
