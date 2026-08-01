import { getRequestEvent } from '$app/server'
import { dev } from '$app/env'
import {
  COOKIE_DOMAIN,
  ALLOWED_HOSTS,
  GOOGLE_CLIENT_ID,
  BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_SECRET,
} from '$app/env/private'
import { betterAuth, type BetterAuthOptions } from 'better-auth/minimal'
import { sveltekitCookies } from 'better-auth/svelte-kit'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { customSession, username } from 'better-auth/plugins'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { resend } from '$lib/resend'
import { RESTRICTED_USERNAMES } from '$lib/constants'
import { resetPasswordTemplate, verifyEmailTemplate } from '$lib/email'

const options = {
  baseURL: {
    allowedHosts: ALLOWED_HOSTS.split(','),
    protocol: dev ? 'http' : 'https',
  },
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg' }),
  advanced: {
    cookiePrefix: 'fancanon',
    crossSubDomainCookies: {
      enabled: true,
      domain: COOKIE_DOMAIN,
    },
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      domain: COOKIE_DOMAIN,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ url, user }) => {
      if (dev) {
        console.log('\nReset Password Link: ', url)
      } else {
        const { error } = await resend.emails.send({
          from: 'fancanon <noreply@fancanon.com>',
          to: user.email,
          subject: 'Reset Your Password — fancanon',
          html: resetPasswordTemplate(url),
        })

        captureException(error)
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (dev) {
        console.log('\nConfirm Your Email Link: ', url)
      } else {
        const { error } = await resend.emails.send({
          from: 'fancanon <noreply@fancanon.com>',
          to: user.email,
          subject: 'Confirm Your Email — fancanon',
          html: verifyEmailTemplate(url),
        })

        captureException(error)
      }
    },
  },
  socialProviders: {
    google: {
      prompt: 'select_account consent',
      clientId: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
      accessType: 'offline',
      // Optional: Map or manipulate incoming Google profile fields
      mapProfileToUser: async (profile) => {
        return {
          // Generates a tentative username from their Google email handle
          username: profile.email.split('@')[0],
        }
      },
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
