import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import { and, asc, eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { story, chapter, like, bookmark } from '$lib/server/db/schema'

async function fetchPageData(storyId: string, chapterIndex: number, userId: string) {
  return Promise.all([
    db.query.story.findFirst({
      where: eq(story.id, storyId),
      columns: { id: true, title: true, description: true, language: true, likeCount: true },
      with: {
        chapters: {
          orderBy: asc(chapter.chapterIndex),
          columns: { id: true, title: true, chapterIndex: true },
        },
        likes: {
          where: eq(like.userId, userId),
          columns: { userId: true, storyId: true },
        },
      },
    }),
    db.query.chapter.findFirst({
      where: and(eq(chapter.storyId, storyId), eq(chapter.chapterIndex, chapterIndex)),
      with: {
        bookmarks: {
          where: eq(bookmark.userId, userId),
          columns: { userId: true, chapterId: true },
        },
        author: {
          columns: { id: true, name: true, username: true, image: true },
        },
      },
    }),
  ])
}

export const load: PageServerLoad = async ({ params, request }) => {
  const storyId = params.storyId
  const chapterIndex = Number(params.chapterIndex)

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''

  let storyRow: Awaited<ReturnType<typeof fetchPageData>>[0]
  let chapterRow: Awaited<ReturnType<typeof fetchPageData>>[1]

  try {
    ;[storyRow, chapterRow] = await fetchPageData(storyId, chapterIndex, userId)
  } catch (err) {
    captureException(err)
    error(500, 'Something Went Wrong!')
  }

  if (!storyRow || !chapterRow) {
    error(404, 'Not Found')
  }

  try {
    return {
      story: storyRow,
      chapter: chapterRow,
    }
  } catch (err) {
    captureException(err)
    error(500, 'Failed To Render Chapter')
  }
}
