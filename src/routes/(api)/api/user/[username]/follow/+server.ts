import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { activity, follow, notification, user } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ params, request }) => {
  const username = params.username

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  const targetUser = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { id: true },
  })

  if (!targetUser) {
    error(404, 'User Not Found')
  }

  if (targetUser.id === session.user.id) {
    error(400, 'Cannot follow yourself')
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [createdFollow] = await tx
        .insert(follow)
        .values({ followerId: session.user.id, followeeId: targetUser.id })
        .onConflictDoNothing()
        .returning()

      // Already following — no-op, don't spam another activity/notification.
      if (!createdFollow) return null

      const [createdActivity] = await tx
        .insert(activity)
        .values({ actorId: session.user.id, verb: 'USER_FOLLOWED', targetUserId: targetUser.id })
        .returning({ id: activity.id })

      await tx.insert(notification).values({
        ownerId: targetUser.id,
        activityId: createdActivity.id,
      })

      return createdFollow
    })

    if (!result) {
      return json({ success: true, message: 'Already following this user' }, { status: 200 })
    }

    return json(
      { success: true, message: 'User followed successfully!', follow: result },
      { status: 200 },
    )
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
