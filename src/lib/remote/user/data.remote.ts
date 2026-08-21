import { error } from '@sveltejs/kit'
import { command, form, getRequestEvent } from '$app/server'
import { eq } from 'drizzle-orm'
import { APIError } from 'better-auth/api'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { user } from '$lib/server/db/schema'
import { schema } from '$lib/components/forms/consent-form'
import {
  updateEmailFormSchema,
  updateNameFormSchema,
  updateUsernameFormSchema,
} from '$lib/components/forms/settings'

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

export const updateName = form(updateNameFormSchema, async (data) => {
  const event = getRequestEvent()

  try {
    await auth.api.updateUser({
      body: {
        name: data.name,
      },
      headers: event.request.headers,
    })
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }
})

export const updateEmail = form(updateEmailFormSchema, async (data) => {
  const event = getRequestEvent()

  try {
    await auth.api.changeEmail({
      body: {
        newEmail: data.newEmail,
      },
      headers: event.request.headers,
    })
  } catch (err) {
    captureException(err)

    if (err instanceof APIError) {
      error(400, err.message)
    }
    error(500, 'Unexpected Error')
  }
})

export const updateUsername = form(updateUsernameFormSchema, async (data) => {
  const event = getRequestEvent()

  try {
    await auth.api.updateUser({
      body: {
        username: data.username,
      },
      headers: event.request.headers,
    })
  } catch (err) {
    captureException(err)

    if (err instanceof APIError) {
      error(400, err.message)
    }
    error(500, 'Unexpected Error')
  }
})

export const deleteAccountCommand = command(async () => {
  const event = getRequestEvent()

  try {
    await auth.api.deleteUser({
      body: {
        callbackURL: '/goodbye', // you can provide a callback URL to redirect after deletion
      },
      headers: event.request.headers,
    })
  } catch (err) {
    captureException(err)

    if (err instanceof APIError) {
      error(400, err.message)
    }
    error(500, 'Unexpected Error')
  }
})
