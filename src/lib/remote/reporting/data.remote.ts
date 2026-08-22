import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { captureException } from '@sentry/sveltekit'

import { createDb } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { report } from '$lib/server/db/schema'
import {
  reportChapterSchema,
  reportCommentSchema,
  reportStorySchema,
  reportUserSchema,
} from '$lib/components/forms/reporting-forms'

export const reportStory = form(reportStorySchema, async (data) => {
  const event = getRequestEvent()
  const session = await auth.api.getSession({ headers: event.request.headers })

  if (!event.platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(event.platform.env)

  try {
    const [createdReport] = await db
      .insert(report)
      .values({
        storyId: data.storyId,
        reportedById: session?.user?.id ?? null,
        reason: data.reason,
        description: data.description,
      })
      .returning()

    return { success: true, message: 'Reported successfully', report: createdReport }
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }
})

export const reportChapter = form(reportChapterSchema, async (data) => {
  const event = getRequestEvent()
  const session = await auth.api.getSession({ headers: event.request.headers })

  if (!event.platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(event.platform.env)

  try {
    const [createdReport] = await db
      .insert(report)
      .values({
        storyId: data.storyId,
        chapterId: data.chapterId,
        reportedById: session?.user?.id ?? null,
        reason: data.reason,
        description: data.description,
      })
      .returning()

    return { success: true, message: 'Reported successfully', report: createdReport }
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }
})

export const reportComment = form(reportCommentSchema, async (data) => {
  const event = getRequestEvent()
  const session = await auth.api.getSession({ headers: event.request.headers })

  if (!event.platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(event.platform.env)

  try {
    const [createdReport] = await db
      .insert(report)
      .values({
        chapterId: data.chapterId,
        commentId: data.commentId,
        reportedById: session?.user?.id ?? null,
        reason: data.reason,
        description: data.description,
      })
      .returning()

    return { success: true, message: 'Reported successfully', report: createdReport }
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }
})

export const reportUser = form(reportUserSchema, async (data) => {
  const event = getRequestEvent()

  const session = await auth.api.getSession({ headers: event.request.headers })

  if (!event.platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(event.platform.env)

  try {
    const [createdReport] = await db
      .insert(report)
      .values({
        userId: data.userId,
        reportedById: session?.user?.id ?? null,
        reason: data.reason,
        description: data.description,
      })
      .returning()

    return { success: true, message: 'Reported successfully', report: createdReport }
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }
})
