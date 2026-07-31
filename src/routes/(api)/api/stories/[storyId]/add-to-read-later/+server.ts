import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { readLater, story } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ params, request }) => {
  const storyId = params.storyId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const readLaterCount = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(readLater)
        .values({ userId: session.user.id, storyId })
        .onConflictDoNothing()
        .returning({ userId: readLater.userId })

      // Already added to read-later — don't double-increment the counter.
      if (!inserted) {
        const [existing] = await tx
          .select({ count: story.readLaterCount })
          .from(story)
          .where(eq(story.id, storyId))
        return existing?.count ?? 0
      }

      const [updated] = await tx
        .update(story)
        .set({ readLaterCount: sql`${story.readLaterCount} + 1` })
        .where(eq(story.id, storyId))
        .returning({ count: story.readLaterCount })

      if (!updated) {
        // storyId didn't reference a real story — roll back the insert.
        tx.rollback()
      }

      return updated.count
    })

    return json({ success: true, readLaterCount }, { status: 200 })
  } catch (err) {
    captureException(err)

    return json(
      { success: false, message: 'Failed To Add To Read Later' },
      { status: 500, statusText: 'internal server error' },
    )
  }
}
