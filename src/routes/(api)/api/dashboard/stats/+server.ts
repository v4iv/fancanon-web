import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { captureException } from '@sentry/sveltekit'

import { auth } from '$lib/server/auth'
import { getAuthorStats } from '$lib/server/helpers/stats-helper'

export const GET: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    const stats = await getAuthorStats(session.user.id)

    return json({ success: true, stats }, { status: 200 })
  } catch (err) {
    captureException(err)

    error(500, 'Something Went Wrong!')
  }
}
