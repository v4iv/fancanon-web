import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { activity, like, notification, story } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ params, request }) => {
  const storyId = params.storyId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(like)
        .values({ userId: session.user.id, storyId })
        .onConflictDoNothing()
        .returning({ storyId: like.storyId })

      // Already liked — no-op, don't double-count or spam another activity/notification.
      if (!inserted) return

      const [updatedStory] = await tx
        .update(story)
        .set({ likeCount: sql`${story.likeCount} + 1` })
        .where(eq(story.id, storyId))
        .returning({ authorId: story.authorId })

      // storyId didn't reference a real story — roll back the like insert.
      if (!updatedStory) {
        tx.rollback()
      }

      const [createdActivity] = await tx
        .insert(activity)
        .values({ actorId: session.user.id, verb: 'STORY_LIKED', storyId })
        .returning({ id: activity.id })

      if (updatedStory.authorId !== session.user.id) {
        await tx.insert(notification).values({
          ownerId: updatedStory.authorId,
          activityId: createdActivity.id,
        })
      }
    })

    return json({ success: true }, { status: 200 })
  } catch (err) {
    captureException(err)
    return json(
      { success: false, message: 'Failed To Like' },
      { status: 500, statusText: 'internal server error' },
    )
  }
}
