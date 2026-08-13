import { defineEnvVars } from '@sveltejs/kit/env'
import * as v from 'valibot'

export const variables = defineEnvVars({
  ORIGIN: {
    public: true,
    static: true,
    description: 'The app origin (base URL), e.g. `https://example.com`.',
  },
  COOKIE_DOMAIN: {
    description: 'for cross subdomain cookie, leading dot is required',
  },
  ALLOWED_HOSTS: {
    description: 'the app dynamic origin urls for the cross subdomain authentication',
  },
  DATABASE_URL: { description: 'The database connection string.' },
  BASE_API_URL: {
    public: true,
    static: true,
  },
  BETTER_AUTH_SECRET: {
    description:
      'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).',
  },
  GTAG_ID: {
    public: true,
    static: true,
    schema: v.pipe(v.string(), v.regex(/G-[A-Z0-9]+/)),
  },
  GOOGLE_CLIENT_ID: {
    description: 'Google client ID',
  },
  GOOGLE_CLIENT_SECRET: {
    description: 'Google client secret',
  },
  RESEND_API_KEY: {
    description: 'Resend API key',
  },
  SENTRY_DSN: {
    public: true,
    static: true,
    description: 'Sentry DSN',
  },
  SENTRY_AUTH_TOKEN: {
    description: 'Sentry Auth Token',
  },
})
