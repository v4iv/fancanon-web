import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { bookmark } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ params, request }) => {
  const chapterId = params.chapterId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    const [created] = await db
      .insert(bookmark)
      .values({ userId: session.user.id, chapterId })
      .onConflictDoNothing()
      .returning()

    // Already bookmarked — fetch and return the existing row instead of erroring.
    if (!created) {
      const [existing] = await db
        .select()
        .from(bookmark)
        .where(and(eq(bookmark.userId, session.user.id), eq(bookmark.chapterId, chapterId)))
      return json({ success: true, bookmark: existing }, { status: 200 })
    }

    return json({ success: true, bookmark: created }, { status: 200 })
  } catch (err) {
    captureException(err)
    error(500, 'Failed To Bookmark')
  }
}
