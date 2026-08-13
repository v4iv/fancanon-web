import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { notification } from '$lib/server/db/schema'

export const POST: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  const { notificationIds }: { notificationIds: string[] } = await request.json()

  if (!Array.isArray(notificationIds) || notificationIds.some((id) => typeof id !== 'string')) {
    error(400, 'notificationIds must be an array of strings')
  }

  if (notificationIds.length === 0) {
    return json({ success: true }, { status: 200 })
  }

  try {
    await db
      .update(notification)
      .set({ seenAt: new Date() })
      .where(
        and(
          inArray(notification.id, notificationIds),
          eq(notification.ownerId, session.user.id),
          isNull(notification.seenAt),
        ),
      )

    return json({ success: true }, { status: 200 })
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
