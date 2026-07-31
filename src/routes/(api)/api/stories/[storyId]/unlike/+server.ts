import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { and, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { activity, like, story } from '$lib/server/db/schema'

export const DELETE: RequestHandler = async ({ params, request }) => {
  const storyId = params.storyId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(like)
        .where(and(eq(like.userId, session.user.id), eq(like.storyId, storyId)))
        .returning({ storyId: like.storyId })

      // Wasn't liked in the first place — no-op.
      if (!deleted) return

      const [updatedStory] = await tx
        .update(story)
        .set({ likeCount: sql`GREATEST(${story.likeCount} - 1, 0)` })
        .where(eq(story.id, storyId))
        .returning({ id: story.id })

      if (!updatedStory) {
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
            eq(activity.verb, 'STORY_LIKED'),
            eq(activity.storyId, storyId),
          ),
        )
    })

    return json({ success: true }, { status: 200 })
  } catch (err) {
    captureException(err)
    return json(
      { success: false, message: 'Failed To Unlike' },
      { status: 500, statusText: 'internal server error' },
    )
  }
}
