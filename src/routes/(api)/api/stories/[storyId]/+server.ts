import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { story, like, readLater } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ params, request }) => {
  const storyId = params.storyId

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''

  try {
    const result = await db.query.story.findFirst({
      where: eq(story.id, storyId),
      with: {
        author: { columns: { id: true, name: true, username: true, image: true } },
        tags: {
          columns: {},
          with: { tag: { columns: { id: true, name: true, slug: true, type: true } } },
        },
        fandoms: {
          columns: {},
          with: { fandom: { columns: { id: true, name: true, slug: true } } },
        },
        likes: {
          where: eq(like.userId, userId),
          columns: { userId: true, storyId: true },
        },
        readLaters: {
          where: eq(readLater.userId, userId),
          columns: { userId: true, storyId: true },
        },
      },
    })

    if (!result) {
      return json({ success: false, message: 'Not Found' }, { status: 404 })
    }

    return json({ success: true, story: result }, { status: 200 })
  } catch (err) {
    captureException(err)
    return json(
      { success: false, message: 'Something went wrong!' },
      { status: 500, statusText: 'internal server error' },
    )
  }
}
