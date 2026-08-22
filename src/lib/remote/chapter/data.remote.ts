import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { and, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { createDb } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { computeWordCount } from '$lib/utils'
import { fanoutActivity } from '$lib/server/helpers/feed-helper'
import { activity, chapter, story } from '$lib/server/db/schema'
import { schema as chapterSchema } from '$lib/components/forms/chapter-form'

export const addNewChapter = form(chapterSchema, async (data) => {
  const event = getRequestEvent()

  const storyId = event.params.storyId as string

  const session = await auth.api.getSession({ headers: event.request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  if (!event.platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(event.platform.env)

  const storyRow = await db.query.story.findFirst({
    where: and(eq(story.id, storyId), eq(story.authorId, session.user.id)),
    columns: { language: true },
  })
  if (!storyRow) {
    error(403, 'Forbidden')
  }

  let createdChapter: typeof chapter.$inferSelect
  let createdActivityId: string

  try {
    const wordDelta = computeWordCount(data.content, storyRow.language)

    const result = await db.transaction(async (tx) => {
      // MAX(chapterIndex) + 1, not COUNT(*) + 1 — a deleted chapter
      // mid-sequence makes COUNT()+1 collide with an existing index
      // (e.g. 1,2,3 -> delete 2 -> count=2 -> next=3, which still
      // exists, violating the (storyId, chapterIndex) unique
      // constraint). MAX()+1 always continues past the highest index.
      const [{ maxIndex }] = await tx
        .select({ maxIndex: sql<number | null>`max(${chapter.chapterIndex})` })
        .from(chapter)
        .where(eq(chapter.storyId, storyId))

      // No prior chapters means this one is what actually "publishes"
      // the story — everything after that is a normal chapter update.
      const isFirstChapter = maxIndex === null

      const [created] = await tx
        .insert(chapter)
        .values({
          authorId: session.user.id,
          storyId,
          title: data.title ?? '',
          content: data.content,
          chapterIndex: (maxIndex ?? 0) + 1,
        })
        .returning()

      await tx
        .update(story)
        .set({
          completed: data.completed,
          wordCount: sql`${story.wordCount} + ${wordDelta}`,
          chapterCount: sql`${story.chapterCount} + 1`,
        })
        .where(eq(story.id, storyId))

      const [createdActivity] = await tx
        .insert(activity)
        .values(
          isFirstChapter
            ? { actorId: session.user.id, verb: 'STORY_PUBLISHED', chapterId: created.id, storyId }
            : {
                actorId: session.user.id,
                verb: 'CHAPTER_PUBLISHED',
                chapterId: created.id,
                storyId,
              },
        )
        .returning({ id: activity.id })

      return { created, activityId: createdActivity.id }
    })

    createdChapter = result.created
    createdActivityId = result.activityId
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }

  // Fan out separately — a failure here shouldn't turn an already-
  // successful chapter creation into an error response for the user.
  try {
    fanoutActivity(createdActivityId)
  } catch (err) {
    captureException(err)
  }

  return {
    success: true,
    message: 'Chapter added successfully',
    storyId,
    chapterIndex: createdChapter.chapterIndex,
  }
})

export const editChapter = form(chapterSchema, async (data) => {
  const event = getRequestEvent()

  const session = await auth.api.getSession({ headers: event.request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  if (!event.platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(event.platform.env)

  const storyId = event.params.storyId as string

  const chapterIndex = Number(event.params.chapterIndex)

  const storyRow = await db.query.story.findFirst({
    where: and(eq(story.id, storyId), eq(story.authorId, session.user.id)),
    columns: { completed: true, language: true },
  })
  if (!storyRow) {
    error(404, 'Not Found')
  }

  const chapterRow = await db.query.chapter.findFirst({
    where: and(eq(chapter.storyId, storyId), eq(chapter.chapterIndex, chapterIndex)),
    columns: { id: true, content: true },
  })
  if (!chapterRow) {
    error(404, 'Not Found')
  }

  try {
    const oldWordCount = computeWordCount(chapterRow.content, storyRow.language)
    const newWordCount = computeWordCount(data.content, storyRow.language)
    const wordDelta = newWordCount - oldWordCount

    const updatedChapter = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(chapter)
        .set({
          title: data.title ?? '',
          content: data.content,
        })
        .where(eq(chapter.id, chapterRow.id))
        .returning()

      if (storyRow.completed !== data.completed || wordDelta !== 0) {
        await tx
          .update(story)
          .set({
            completed: data.completed,
            ...(wordDelta !== 0 && { wordCount: sql`${story.wordCount} + ${wordDelta}` }),
          })
          .where(eq(story.id, storyId))
      }

      return updated
    })

    return {
      success: true,
      message: 'Edit chapter successful!',
      updatedChapter,
      storyId,
      chapterIndex: updatedChapter.chapterIndex,
    }
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }
})
