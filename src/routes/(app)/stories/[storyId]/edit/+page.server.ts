import type { PageServerLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { createDb } from '$lib/server/db'
import { createAuth } from '$lib/server/auth'
import { story, tag } from '$lib/server/db/schema'
import { NO_WARNING_CHOSEN_TAG_NAME } from '$lib/constants'
import type { StorySchemaOutput } from '$lib/components/forms/story-form'

export const load: PageServerLoad = async ({ platform, params, request }) => {
  if (!platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(platform.env)
  const auth = createAuth(db)

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    redirect(303, '/auth/sign-in')
  }

  const storyId = params.storyId

  const storyRow = await db.query.story.findFirst({
    where: eq(story.id, storyId),
    with: {
      fandoms: {
        columns: {},
        with: { fandom: { columns: { id: true, name: true } } },
      },
      tags: {
        columns: {},
        with: { tag: { columns: { id: true, name: true, slug: true, type: true } } },
      },
    },
  })

  if (!storyRow) {
    error(404, 'Not Found')
  }
  if (storyRow.authorId !== session.user.id) {
    error(403, 'Forbidden')
  }

  const warnings = await db.select({ name: tag.name }).from(tag).where(eq(tag.type, 'WARNING'))

  const currentData = {
    title: storyRow.title,
    description: storyRow.description || '',
    contentRating: storyRow.contentRating,
    language: storyRow.language as StorySchemaOutput['language'], // workaround for type narrowing
    fandoms: storyRow.fandoms.map(({ fandom }) => ({ id: fandom.id, name: fandom.name })),
    tags: storyRow.tags.map(({ tag }) => ({ name: tag.name, type: tag.type })),
    completed: storyRow.completed,
  }

  return {
    story: storyRow,
    currentData,
    warnings: warnings.filter((t) => t.name !== NO_WARNING_CHOSEN_TAG_NAME).map((t) => t.name),
  }
}
