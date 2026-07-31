import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { desc, eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { story } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stories = await db
      .select()
      .from(story)
      .where(eq(story.authorId, session.user.id))
      .orderBy(desc(story.createdAt))

    return json({ success: true, stories }, { status: 200 })
  } catch (err) {
    captureException(err)
    return json(
      { success: false, message: 'Something went wrong!' },
      { status: 500, statusText: 'internal server error' },
    )
  }
}
