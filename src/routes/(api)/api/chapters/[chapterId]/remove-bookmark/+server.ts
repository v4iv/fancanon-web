import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { captureException } from '@sentry/sveltekit'
import { and, eq } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { bookmark } from '$lib/server/db/schema'

export const DELETE: RequestHandler = async ({ params, request }) => {
  const chapterId = params.chapterId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    const [removed] = await db
      .delete(bookmark)
      .where(and(eq(bookmark.userId, session.user.id), eq(bookmark.chapterId, chapterId)))
      .returning()

    return json({ success: true, removed: removed ?? null }, { status: 200 })
  } catch (err) {
    captureException(err)
    error(500, 'Failed To Remove')
  }
}
