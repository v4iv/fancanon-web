import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { captureException } from '@sentry/sveltekit'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { activity, comment, commentLike } from '$lib/server/db/schema'

export const DELETE: RequestHandler = async ({ params, request }) => {
  const commentId = params.commentId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(commentLike)
        .where(and(eq(commentLike.userId, session.user.id), eq(commentLike.commentId, commentId)))
        .returning({ commentId: commentLike.commentId })

      // Wasn't liked in the first place — no-op.
      if (!deleted) return

      const [updatedComment] = await tx
        .update(comment)
        .set({ likeCount: sql`GREATEST(${comment.likeCount} - 1, 0)` })
        .where(eq(comment.id, commentId))
        .returning({ id: comment.id })

      if (!updatedComment) {
        tx.rollback()
      }

      // Deleting the activity cascades to notification/feedItem rows
      // referencing it (both declared onDelete: 'cascade'), so this
      // single delete cleans up the fan-out too.
      await tx
        .delete(activity)
        .where(
          and(
            eq(activity.actorId, session.user.id),
            eq(activity.verb, 'COMMENT_LIKED'),
            eq(activity.commentId, commentId),
          ),
        )
    })

    return json({ success: true }, { status: 200 })
  } catch (err) {
    captureException(err)
    error(500, 'Failed To Unlike')
  }
}
