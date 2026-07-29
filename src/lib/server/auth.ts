import { getRequestEvent } from '$app/server'
import { dev } from '$app/env'
import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private'
import { betterAuth, type BetterAuthOptions } from 'better-auth/minimal'
import { sveltekitCookies } from 'better-auth/svelte-kit'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { customSession, username } from 'better-auth/plugins'

import { db } from '$lib/server/db'
import { RESTRICTED_USERNAMES } from '$lib/constants'

const options = {
  baseURL: ORIGIN,
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  },
  // additional fields for user
  user: {
    additionalFields: {
      explicitConsentAt: {
        type: 'date',
        required: false,
        defaultValue: null,
      },
      explicitConsentVersion: {
        type: 'number',
        required: false,
        defaultValue: null,
      },
    },
  },
  plugins: [
    username({
      usernameValidator: (username) => {
        const normalized = username.trim().toLowerCase()

        if (dev) return true

        return (
          !RESTRICTED_USERNAMES.some(
            (restricted) =>
              normalized === restricted ||
              normalized.startsWith(restricted) ||
              normalized.endsWith(restricted),
          ) && /^[a-zA-Z0-9_.]+$/.test(username)
        )
      },
    }),
  ],
} satisfies BetterAuthOptions

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      // now both user and session will infer the fields added by plugins and your custom fields
      return {
        user,
        session,
      }
    }, options), // pass options here
    sveltekitCookies(getRequestEvent), // make sure this is the last plugin in the array
  ],
})
