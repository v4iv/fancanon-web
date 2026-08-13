import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { activity, follow, user } from '$lib/server/db/schema'

export const DELETE: RequestHandler = async ({ params, request }) => {
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

  try {
    const result = await db.transaction(async (tx) => {
      const [removed] = await tx
        .delete(follow)
        .where(and(eq(follow.followerId, session.user.id), eq(follow.followeeId, targetUser.id)))
        .returning()

      // Wasn't following in the first place — no-op.
      if (!removed) return null

      // Deleting the activity cascades to notification/feedItem rows
      // referencing it (both declared onDelete: 'cascade'), so this
      // single delete cleans up the fan-out too.
      await tx
        .delete(activity)
        .where(
          and(
            eq(activity.actorId, session.user.id),
            eq(activity.verb, 'USER_FOLLOWED'),
            eq(activity.targetUserId, targetUser.id),
          ),
        )

      return removed
    })

    if (!result) {
      return json({ success: true, message: 'Not following this user' }, { status: 200 })
    }

    return json(
      { success: true, message: 'User unfollowed successfully!', unfollow: result },
      { status: 200 },
    )
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
