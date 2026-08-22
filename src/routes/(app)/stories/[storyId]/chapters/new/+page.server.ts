import type { PageServerLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { createDb } from '$lib/server/db'
import { createAuth } from '$lib/server/auth'
import { story } from '$lib/server/db/schema'

export const load: PageServerLoad = async ({ platform, request, params }) => {
  if (!platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(platform.env)
  const auth = createAuth(db)

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    throw redirect(303, `/auth/sign-in?redirect=${encodeURIComponent('/stories/new')}`)
  }

  const storyId = params.storyId

  const storyRow = await db.query.story.findFirst({
    where: eq(story.id, storyId),
    columns: { id: true, title: true, authorId: true, completed: true },
  })

  if (!storyRow) {
    error(404, 'Not Found')
  } else if (storyRow.authorId !== session.user.id) {
    error(403, 'Forbidden')
  }

  return { story: storyRow }
}
