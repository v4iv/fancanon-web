import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { captureException } from '@sentry/sveltekit'
import { and, eq, sql } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { comment, chapter, story } from '$lib/server/db/schema'

// TODO: switch to soft delete (e.g. a `deletedAt` timestamp + blank out
// `content`) instead of a hard DELETE. Hard delete cascades through
// comment.parentId onto the entire reply subtree (see note below), which
// also means storyCommentCount only ever decrements by 1 regardless of how
// many descendant replies got swept away — soft delete would sidestep both
// issues by leaving replies and counts untouched.
export const DELETE: RequestHandler = async ({ params, request }) => {
  const commentId = params.commentId

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(comment)
        .where(and(eq(comment.id, commentId), eq(comment.authorId, session.user.id)))
        .returning({ parentId: comment.parentId, chapterId: comment.chapterId })

      if (!deleted) return null

      const [chapterRow] = await tx
        .select({ storyId: chapter.storyId })
        .from(chapter)
        .where(eq(chapter.id, deleted.chapterId))

      if (chapterRow) {
        await tx
          .update(story)
          .set({ commentCount: sql`GREATEST(${story.commentCount} - 1, 0)` })
          .where(eq(story.id, chapterRow.storyId))
      }

      if (deleted.parentId) {
        await tx
          .update(comment)
          .set({ replyCount: sql`GREATEST(${comment.replyCount} - 1, 0)` })
          .where(eq(comment.id, deleted.parentId))
      }

      return deleted
    })

    if (result) {
      return json({ success: true }, { status: 200 })
    }

    const [existing] = await db
      .select({ id: comment.id })
      .from(comment)
      .where(eq(comment.id, commentId))

    if (!existing) {
      error(404, 'Not Found')
    }
    error(403, 'Forbidden')
  } catch (err) {
    captureException(err)
    error(500, 'Failed To Delete')
  }
}
