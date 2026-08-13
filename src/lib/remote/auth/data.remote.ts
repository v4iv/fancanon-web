import { form, getRequestEvent } from '$app/server'
import { Md5 } from 'ts-md5'
import { error } from '@sveltejs/kit'
import { APIError } from 'better-auth/api'
import { captureException } from '@sentry/sveltekit'

import { auth } from '$lib/server/auth'
import { schema as signUpSchema } from '$lib/components/forms/sign-up-form'
import { schema as signInSchema } from '$lib/components/forms/sign-in-form'
import { schema as resetPasswordSchema } from '$lib/components/forms/reset-password-form'
import { schema as forgotPasswordSchema } from '$lib/components/forms/forgot-password-form'
import { schema as changePasswordSchema } from '$lib/components/forms/change-password-form'

export const signUp = form(signUpSchema, async (data) => {
  const event = getRequestEvent()

  try {
    // Gravatar uses MD5 hashes from an email address to get the image
    const hash = Md5.hashStr(data.email.toLowerCase())

    await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        username: data.username,
        displayUsername: data.username,
        password: data._newPassword,
        image: `https://www.gravatar.com/avatar/${hash}?d=identicon`,
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

  return { success: true, message: 'Sign Up Successful!' }
})

export const signIn = form(signInSchema, async (data) => {
  const event = getRequestEvent()

  try {
    await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data._password,
      },
      headers: event.request.headers,
    })
  } catch (err) {
    console.error(err)
    captureException(err)

    if (err instanceof APIError) {
      error(400, err.message)
    }
    error(500, 'Unexpected Error')
  }

  return { success: true, message: 'Log In Successful!' }
})

export const resetPassword = form(resetPasswordSchema, async (data) => {
  const event = getRequestEvent()

  try {
    await auth.api.resetPassword({
      body: {
        token: data._token,
        newPassword: data._newPassword,
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

  return { success: true, message: 'Password reset successfully!' }
})

export const forgotPassword = form(forgotPasswordSchema, async (data) => {
  const event = getRequestEvent()

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: data.email,
        redirectTo: '/auth/reset-password',
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

  return { success: true, message: 'Password reset link sent successfully!' }
})

export const changePassword = form(changePasswordSchema, async (data) => {
  const event = getRequestEvent()

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: data._currentPassword,
        newPassword: data._newPassword,
        revokeOtherSessions: true,
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

  return { success: true, message: 'Password changed successfully!' }
})
