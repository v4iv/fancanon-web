import { Md5 } from 'ts-md5'
import { form } from '$app/server'
import { error } from '@sveltejs/kit'
import { APIError } from 'better-auth/api'

import { auth } from '$lib/server/auth'
import { schema as signUpSchema } from '$lib/components/forms/sign-up-form'
import { schema as signInSchema } from '$lib/components/forms/sign-in-form'

export const signUp = form(signUpSchema, async (data) => {
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
    })
  } catch (err) {
    console.error(err)

    if (err instanceof APIError) {
      error(400, err.message)
    }
    error(500, 'Unexpected Error')
  }

  return { success: true, message: 'Sign Up Successful!' }
})

export const signIn = form(signInSchema, async (data) => {
  try {
    await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data._password,
      },
    })
  } catch (err) {
    console.error(err)

    if (err instanceof APIError) {
      error(400, err.message)
    }
    error(500, 'Unexpected Error')
  }

  return { success: true, message: 'Log In Successful!' }
})
