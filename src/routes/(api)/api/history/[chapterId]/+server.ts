import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { history } from '$lib/server/db/schema'

export const DELETE: RequestHandler = async ({ params, request }) => {
  const { chapterId } = params

  if (!chapterId) {
    error(400, 'Missing chapterId')
  }

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    const [deleted] = await db
      .delete(history)
      .where(and(eq(history.userId, session.user.id), eq(history.chapterId, chapterId)))
      .returning({ chapterId: history.chapterId })

    if (!deleted) {
      error(404, 'Not Found')
    }

    return json({ success: true }, { status: 200 })
  } catch (err) {
    captureException(err)

    error(500, 'Something Went Wrong!')
  }
}
