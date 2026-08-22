import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { and, eq } from 'drizzle-orm'

import { auth } from '$lib/server/auth'
import { story, chapter } from '$lib/server/db/schema'
import { getDb } from '$lib/server/db'

export const load: PageServerLoad = async ({ platform, params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    redirect(303, '/auth/sign-in')
  }

  if (!platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = getDb(platform.env)
  const storyId = params.storyId
  const chapterIndex = Number(params.chapterIndex)

  const [storyRow, chapterRow] = await Promise.all([
    db.query.story.findFirst({
      where: eq(story.id, storyId),
      columns: { id: true, title: true, authorId: true, completed: true },
    }),
    db.query.chapter.findFirst({
      where: and(eq(chapter.storyId, storyId), eq(chapter.chapterIndex, chapterIndex)),
    }),
  ])

  if (!storyRow) {
    error(404, 'Not Found')
  }
  if (storyRow.authorId !== session.user.id) {
    error(403, 'Forbidden')
  }
  if (!chapterRow) {
    error(404, 'Not Found')
  }

  const currentData = {
    title: chapterRow.title.length ? chapterRow.title : undefined,
    content: chapterRow.content,
    embed: chapterRow.embed,
    completed: storyRow.completed,
  }

  return {
    story: storyRow,
    chapter: chapterRow,
    currentData,
  }
}
