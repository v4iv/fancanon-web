import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { captureException } from '@sentry/sveltekit'
import { eq, sql } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { activity, comment, commentLike, notification } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ params, request }) => {
  const commentId = params.commentId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(commentLike)
        .values({ userId: session.user.id, commentId })
        .onConflictDoNothing()
        .returning({ commentId: commentLike.commentId })

      // Already liked — no-op, don't double-count or spam another activity/notification.
      if (!inserted) return

      const [updatedComment] = await tx
        .update(comment)
        .set({ likeCount: sql`${comment.likeCount} + 1` })
        .where(eq(comment.id, commentId))
        .returning({ authorId: comment.authorId })

      // commentId didn't reference a real comment — roll back the like insert.
      if (!updatedComment) {
        tx.rollback()
      }

      const [createdActivity] = await tx
        .insert(activity)
        .values({ actorId: session.user.id, verb: 'COMMENT_LIKED', commentId })
        .returning({ id: activity.id })

      if (updatedComment.authorId !== session.user.id) {
        await tx.insert(notification).values({
          ownerId: updatedComment.authorId,
          activityId: createdActivity.id,
        })
      }
    })

    return json({ success: true }, { status: 200 })
  } catch (err) {
    captureException(err)
    error(500, 'Failed To Like')
  }
}
