import type { PageServerLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'

import { createAuth } from '$lib/server/auth'
import { createDb } from '$lib/server/db'

export const load: PageServerLoad = async ({ platform, request }) => {
  if (!platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(platform.env)
  const auth = createAuth(db)

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    redirect(303, `/auth/sign-in?redirect=${encodeURIComponent('/settings')}`)
  }

  return { user: session.user }
}
