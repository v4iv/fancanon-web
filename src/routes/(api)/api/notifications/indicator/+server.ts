import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { notification } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    const [{ count: unseenCount }] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(notification)
      .where(and(eq(notification.ownerId, session.user.id), isNull(notification.seenAt)))

    return json({ success: true, unseenCount })
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
