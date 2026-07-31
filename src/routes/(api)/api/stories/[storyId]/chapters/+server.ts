import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { asc, eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { chapter, bookmark } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ request, params }) => {
  const storyId = params.storyId

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''

  try {
    const chapters = await db.query.chapter.findMany({
      where: eq(chapter.storyId, storyId),
      orderBy: asc(chapter.chapterIndex),
      with: {
        bookmarks: {
          where: eq(bookmark.userId, userId),
          columns: { userId: true, chapterId: true },
        },
      },
    })

    return json({ success: true, chapters }, { status: 200 })
  } catch (err) {
    captureException(err)

    error(500, 'Something Went Wrong!')
  }
}
