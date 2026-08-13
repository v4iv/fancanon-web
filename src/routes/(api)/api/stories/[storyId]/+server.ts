import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { story } from '$lib/server/db/schema'
import { storyWithForUser } from '$lib/server/helpers/story-helper'

export const GET: RequestHandler = async ({ params, request }) => {
  const storyId = params.storyId

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''

  const storyRow = await db.query.story.findFirst({
    where: eq(story.id, storyId),
    with: storyWithForUser(userId),
  })

  if (!storyRow) {
    error(404, 'Not Found')
  }

  return json({ success: true, story: storyRow }, { status: 200 })
}
