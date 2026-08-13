import type { PageLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'
import { captureException } from '@sentry/sveltekit'

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch(`/api/dashboard/stories`)

  if (response.status === 401) {
    redirect(303, `/auth/sign-in?redirect=${encodeURIComponent(`/dashboard`)}`)
  }

  if (response.status !== 200) {
    captureException(response)

    error(response.status, response.statusText)
  }

  const { stories } = await response.json()

  return {
    stories,
  }
}
