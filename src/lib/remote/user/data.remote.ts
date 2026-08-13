import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { user } from '$lib/server/db/schema'
import { schema } from '$lib/components/forms/consent-form'

export const contentConsent = form(schema, async () => {
  const event = getRequestEvent()
  const session = await auth.api.getSession({ headers: event.request.headers })

  try {
    if (session?.user) {
      await db
        .update(user)
        .set({
          explicitConsentAt: new Date(),
          explicitConsentVersion: 1,
        })
        .where(eq(user.id, session.user.id))

      return { success: true }
    }

    event.cookies.set('explicit-consent', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: true,
    })

    return { success: true }
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }
})
