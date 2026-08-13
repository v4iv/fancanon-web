import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

import { auth } from '$lib/server/auth'

export const load: PageServerLoad = async ({ url, request }) => {
  const redirectTo = url.searchParams.get('redirect') ?? '/'

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (session?.user && session.user.explicitConsentAt !== null) {
    throw redirect(303, redirectTo)
  }

  return {}
}
