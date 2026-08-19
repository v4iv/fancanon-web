import type { PageLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'
import { BASE_API_URL } from '$app/env/public'
import { captureException } from '@sentry/sveltekit'

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch(`${BASE_API_URL}/v1/dashboard/stories`, { credentials: 'include' })

  if (response.status === 401) {
    redirect(303, `/auth/sign-in?redirect=${encodeURIComponent(`/dashboard`)}`)
  }

  if (response.status !== 200) {
    captureException(response)

    error(response.status, response.statusText)
  }

  const { stories }: any = await response.json()

  return {
    stories,
  }
}
