import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

import { auth } from '$lib/server/auth'

export const load: PageServerLoad = async ({ request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    redirect(303, `/auth/sign-in?redirect=${encodeURIComponent('/feed')}`)
  }

  return { user: session.user }
}
