import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { captureException } from '@sentry/sveltekit'
import { and, eq, notInArray } from 'drizzle-orm'

import { createDb } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import {
  createStoryTagLinks,
  resolveStoryTagIds,
  syncStoryTagLinks,
} from '$lib/server/helpers/tags-helper'
import { story, storyFandom } from '$lib/server/db/schema'
import { schema as storySchema } from '$lib/components/forms/story-form'
import { getOrCreateOriginalContentFandom } from '$lib/server/helpers/story-helper'

export const createNewStory = form(storySchema, async (data) => {
  const event = getRequestEvent()

  const session = await auth.api.getSession({ headers: getRequestEvent().request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  const fandoms: { value: string }[] = JSON.parse(data.fandoms)

  let createdStory: typeof story.$inferSelect

  if (!event.platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(event.platform.env)

  try {
    const resolvedTags = await resolveStoryTagIds({
      relationshipTags: data.relationshipTags,
      characterTags: data.characterTags,
      freeformTags: data.freeformTags,
      warningTags: data.warningTags,
    })

    // No activity/fan-out here anymore — the story doesn't "publish" as an
    // activity until its first chapter goes up (see addNewChapter).
    createdStory = await db.transaction(async (tx) => {
      const [createdStoryRow] = await tx
        .insert(story)
        .values({
          authorId: session.user.id,
          title: data.title,
          description: data.description,
          contentRating: data.contentRating,
          language: data.language,
        })
        .returning()

      // fandoms.length, not data.fandoms.length — see note above.
      if (fandoms.length > 0) {
        await tx
          .insert(storyFandom)
          .values(fandoms.map((f) => ({ storyId: createdStoryRow.id, fandomId: f.value })))
      } else {
        const fallbackFandomId = await getOrCreateOriginalContentFandom(tx)
        await tx
          .insert(storyFandom)
          .values({ storyId: createdStoryRow.id, fandomId: fallbackFandomId })
      }

      await createStoryTagLinks(tx, createdStoryRow.id, resolvedTags)

      return createdStoryRow
    })
  } catch (err) {
    captureException(err)

    error(500, 'Unexpected Error')
  }

  return { success: true, message: 'Story create successful!', story: createdStory }
})

export const editStory = form(storySchema, async (data) => {
  const event = getRequestEvent()
  const session = await auth.api.getSession({ headers: event.request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  const fandoms: { value: string }[] = JSON.parse(data.fandoms)

  const storyId = event.params.storyId
  if (!storyId) {
    error(400, 'Missing storyId')
  }

  if (!event.platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(event.platform.env)

  const storyRow = await db.query.story.findFirst({ where: eq(story.id, storyId) })
  if (!storyRow) {
    error(404, 'Not Found')
  }
  if (storyRow.authorId !== session.user.id) {
    error(403, 'Forbidden')
  }

  try {
    const resolvedTags = await resolveStoryTagIds({
      relationshipTags: data.relationshipTags,
      characterTags: data.characterTags,
      freeformTags: data.freeformTags,
      warningTags: data.warningTags,
    })

    const updatedStory = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(story)
        .set({
          title: data.title,
          description: data.description,
          contentRating: data.contentRating,
          language: data.language,
          completed: data.completed,
        })
        .where(eq(story.id, storyId))
        .returning()

      // fandoms.length, not data.fandoms.length — see note above.
      const keepFandomIds =
        fandoms.length > 0
          ? fandoms.map((f) => f.value)
          : [await getOrCreateOriginalContentFandom(tx)]

      await tx
        .insert(storyFandom)
        .values(keepFandomIds.map((fandomId) => ({ storyId, fandomId })))
        .onConflictDoNothing({ target: [storyFandom.storyId, storyFandom.fandomId] })

      await tx
        .delete(storyFandom)
        .where(
          and(eq(storyFandom.storyId, storyId), notInArray(storyFandom.fandomId, keepFandomIds)),
        )

      await syncStoryTagLinks(tx, storyId, resolvedTags)

      return updated
    })

    return { success: true, message: 'Story edit successful!', story: updatedStory }
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }
})
