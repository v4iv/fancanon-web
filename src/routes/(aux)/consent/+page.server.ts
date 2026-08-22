import type { PageServerLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'

import { createDb } from '$lib/server/db'
import { createAuth } from '$lib/server/auth'

export const load: PageServerLoad = async ({ platform, url, request }) => {
  if (!platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(platform.env)
  const auth = createAuth(db)

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const redirectTo = url.searchParams.get('redirect') ?? '/'

  if (session?.user && session.user.explicitConsentAt !== null) {
    throw redirect(303, redirectTo)
  }

  return {}
}
