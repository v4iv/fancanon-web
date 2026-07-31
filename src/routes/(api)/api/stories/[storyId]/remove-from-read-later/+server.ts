import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { and, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { readLater, story } from '$lib/server/db/schema'

export const DELETE: RequestHandler = async ({ params, request }) => {
  const storyId = params.storyId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return error(401, 'Unauthorized')
  }

  try {
    const readLaterCount = await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(readLater)
        .where(and(eq(readLater.userId, session.user.id), eq(readLater.storyId, storyId)))
        .returning({ userId: readLater.userId })

      // Nothing was saved — don't decrement, just report the current count.
      if (!deleted) {
        const [existing] = await tx
          .select({ count: story.readLaterCount })
          .from(story)
          .where(eq(story.id, storyId))
        return existing?.count ?? 0
      }

      const [updated] = await tx
        .update(story)
        .set({ readLaterCount: sql`GREATEST(${story.readLaterCount} - 1, 0)` })
        .where(eq(story.id, storyId))
        .returning({ count: story.readLaterCount })

      if (!updated) {
        // storyId didn't reference a real story — roll back the delete.
        tx.rollback()
      }

      return updated.count
    })

    return json({ success: true, readLaterCount }, { status: 200 })
  } catch (err) {
    captureException(err)

    return error(500, 'Failed to remove from Read Later')
  }
}
