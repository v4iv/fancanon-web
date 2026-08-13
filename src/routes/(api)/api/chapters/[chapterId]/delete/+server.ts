import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { and, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { chapter, story } from '$lib/server/db/schema'

export const DELETE: RequestHandler = async ({ params, request }) => {
  const chapterId = params.chapterId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(chapter)
        .where(and(eq(chapter.id, chapterId), eq(chapter.authorId, session.user.id)))
        .returning({ storyId: chapter.storyId })

      if (!deleted) return null

      await tx
        .update(story)
        .set({ chapterCount: sql`GREATEST(${story.chapterCount} - 1, 0)` })
        .where(eq(story.id, deleted.storyId))

      return deleted
    })

    if (result) {
      return json({ success: true }, { status: 200 })
    }

    // Delete matched nothing — figure out why, for an accurate error response.
    const [existing] = await db
      .select({ id: chapter.id })
      .from(chapter)
      .where(eq(chapter.id, chapterId))

    if (!existing) {
      error(404, 'Not Found')
    }
    error(403, 'Forbidden')
  } catch (err) {
    captureException(err)
    error(500, 'Failed To Delete')
  }
}
