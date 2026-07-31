import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { story } from '$lib/server/db/schema'
import { captureException, logger } from '@sentry/sveltekit'

export const DELETE: RequestHandler = async ({ params, request }) => {
  const storyId = params.storyId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return error(401, 'Unauthorized')
  }

  try {
    const [deleted] = await db
      .delete(story)
      .where(and(eq(story.id, storyId), eq(story.authorId, session.user.id)))
      .returning({ id: story.id })

    if (deleted) {
      logger.info('Story Deleted', deleted)
      return json({ success: true }, { status: 200 })
    }

    // Delete matched nothing — figure out why, for an accurate error response.
    const [existing] = await db.select({ id: story.id }).from(story).where(eq(story.id, storyId))

    if (!existing) {
      return error(404, 'Not Found')
    }

    return error(403, 'Forbidden')
  } catch (err) {
    captureException(err)

    return error(500, 'Something Went Wrong!')
  }
}
