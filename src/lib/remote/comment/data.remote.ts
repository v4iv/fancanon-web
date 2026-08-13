import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import { eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { schema as commentSchema } from '$lib/components/forms/comment-form'
import { activity, chapter, comment, notification, story } from '$lib/server/db/schema'

export const addNewComment = form(commentSchema, async (data) => {
  const event = getRequestEvent()

  const session = await auth.api.getSession({ headers: event.request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  const chapterRow = await db.query.chapter.findFirst({
    where: eq(chapter.id, data.chapterId),
    columns: { storyId: true, authorId: true },
  })

  if (!chapterRow) {
    error(404, 'Not Found')
  }

  // Resolve who should be notified BEFORE the transaction — a reply
  // notifies the parent comment's author, a top-level comment notifies
  // the chapter's author.
  let notifyOwnerId: string | null = null

  if (data.parentId) {
    const parentComment = await db.query.comment.findFirst({
      where: eq(comment.id, data.parentId),
      columns: { authorId: true },
    })
    if (!parentComment) {
      error(404, 'Parent comment not found')
    }
    notifyOwnerId = parentComment.authorId !== session.user.id ? parentComment.authorId : null
  } else {
    notifyOwnerId = chapterRow.authorId !== session.user.id ? chapterRow.authorId : null
  }

  try {
    const createdComment = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(comment)
        .values({
          content: data.content,
          authorId: session.user.id,
          chapterId: data.chapterId,
          parentId: data.parentId ?? null,
        })
        .returning()

      await tx
        .update(story)
        .set({ commentCount: sql`${story.commentCount} + 1` })
        .where(eq(story.id, chapterRow.storyId))

      if (data.parentId) {
        await tx
          .update(comment)
          .set({ replyCount: sql`${comment.replyCount} + 1` })
          .where(eq(comment.id, data.parentId))
      }

      const [createdActivity] = await tx
        .insert(activity)
        .values({
          actorId: session.user.id,
          verb: data.parentId ? 'REPLY_POSTED' : 'COMMENT_POSTED',
          commentId: created.id,
          chapterId: data.chapterId,
          storyId: chapterRow.storyId,
        })
        .returning({ id: activity.id })

      if (notifyOwnerId) {
        await tx.insert(notification).values({
          ownerId: notifyOwnerId,
          activityId: createdActivity.id,
        })
      }

      return created
    })

    return { success: true, message: 'Comment add successful!', comment: createdComment }
  } catch (err) {
    captureException(err)
    error(500, 'Unexpected Error')
  }
})
