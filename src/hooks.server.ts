import { redirect, type Handle, type HandleFetch } from '@sveltejs/kit'
import { building, dev } from '$app/env'
import { BASE_API_URL, SENTRY_DSN } from '$app/env/public'
import { sequence } from '@sveltejs/kit/hooks'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import {
  handleErrorWithSentry,
  sentryHandle,
  initCloudflareSentryHandle,
  captureException,
} from '@sentry/sveltekit'

import { getDb } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { getTextDirection } from '$lib/paraglide/runtime'
import { paraglideMiddleware } from '$lib/paraglide/server'

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  if (request.url.startsWith(BASE_API_URL)) {
    const cookie = event.request.headers.get('cookie') || ''

    request.headers.set('cookie', cookie)
  }

  return fetch(request)
}

export const handleDb: Handle = async ({ event, resolve }) => {
  if (event.platform?.env) {
    event.locals.db = getDb(event.platform.env)
  }

  return resolve(event)
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({ headers: event.request.headers })

  if (session) {
    event.locals.session = session.session
    event.locals.user = session.user
  }

  return svelteKitHandler({ event, resolve, auth, building })
}

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request

    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html
          .replace('%paraglide.lang%', locale)
          .replace('%paraglide.dir%', getTextDirection(locale)),
    })
  })

const handleExplicitConsent: Handle = async ({ event, resolve }) => {
  const storyId = event.params.storyId

  if (storyId) {
    const session = await auth.api.getSession({
      headers: event.request.headers,
    })

    try {
      const res: any = await fetch(`${BASE_API_URL}/v1/stories/${storyId}/content-rating`, {
        credentials: 'include',
      })

      const storyRow = await res.json()

      if (storyRow) {
        if (storyRow.contentRating === 'EXPLICIT') {
          const isAuthor = session?.user?.id === storyRow.author.id

          if (!isAuthor) {
            const hasConsent = session?.user
              ? Boolean(session.user.explicitConsentAt)
              : event.cookies.get('explicit-consent') === 'true'

            if (!hasConsent) {
              const targetRedirect = event.url.searchParams.get('redirect') || event.url.pathname

              throw redirect(303, `/consent?redirect=${encodeURIComponent(targetRedirect)}`)
            }
          }
        }
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
        throw err
      }

      captureException(err)
    }
  }

  return resolve(event)
}

export const handleError = handleErrorWithSentry()

export const handle: Handle = sequence(
  initCloudflareSentryHandle({
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
  }),
  sentryHandle(),
  handleParaglide,
  handleBetterAuth,
  handleExplicitConsent,
)
