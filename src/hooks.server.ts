import type { Handle, HandleFetch } from '@sveltejs/kit'
import { building, dev } from '$app/env'
import { BASE_API_URL, SENTRY_DSN } from '$app/env/public'
import { sequence } from '@sveltejs/kit/hooks'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { handleErrorWithSentry, sentryHandle, initCloudflareSentryHandle } from '@sentry/sveltekit'

import { auth } from '$lib/server/auth'
import { getTextDirection } from '$lib/paraglide/runtime'
import { paraglideMiddleware } from '$lib/paraglide/server'

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

const handleBetterAuth: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({ headers: event.request.headers })

  if (session) {
    event.locals.session = session.session
    event.locals.user = session.user
  }

  return svelteKitHandler({ event, resolve, auth, building })
}

export const handleError = handleErrorWithSentry()

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  if (request.url.startsWith(BASE_API_URL)) {
    const cookie = event.request.headers.get('cookie') || ''

    request.headers.set('cookie', cookie)
  }

  return fetch(request)
}

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
  }),
  sentryHandle(),
  handleParaglide,
  handleBetterAuth,
)
