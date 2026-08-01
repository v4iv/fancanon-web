import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { and, asc, eq, isNull, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import type { CommentType } from '$lib/types'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
import { executeRows } from '$lib/server/helpers/db-helper'
import { comment, commentLike } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ params, url, request }) => {
  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)
  const chapterId = params.chapterId

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''
  const offset = (page - 1) * limit

  try {
    // Step 1: paginate ONLY top-level comments — bounded by `limit`, not
    // by total comments on the chapter.
    const topLevel = await db.query.comment.findMany({
      where: and(eq(comment.chapterId, chapterId), isNull(comment.parentId)),
      orderBy: asc(comment.createdAt),
      limit,
      offset,
      with: {
        author: true,
        likes: {
          where: eq(commentLike.userId, userId),
          columns: { userId: true, commentId: true },
        },
      },
    })

    if (topLevel.length === 0) {
      const [{ count: totalCount }] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(comment)
        .where(and(eq(comment.chapterId, chapterId), isNull(comment.parentId)))
      return json({
        success: true,
        comments: [],
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
        hasMore: false,
      })
    }

    // Step 2: fetch every descendant of just these top-level comments.
    // Still bounded work — proportional to reply activity under THIS
    // page's comments, not the whole chapter's history.
    const topLevelIds = topLevel.map((c) => c.id)

    const replyIds = (
      await executeRows<{ id: string }>(
        sql`
	WITH RECURSIVE reply_tree AS (
		SELECT id, parent_id, 1 AS depth
		FROM ${comment}
		WHERE parent_id IN ${topLevelIds}
		UNION ALL
		SELECT c.id, c.parent_id, rt.depth + 1
		FROM ${comment} c
		JOIN reply_tree rt ON c.parent_id = rt.id
	)
	SELECT id FROM reply_tree
`,
      )
    ).map((r) => r.id)

    const replies =
      replyIds.length > 0
        ? await db.query.comment.findMany({
            where: sql`${comment.id} IN ${replyIds}`,
            orderBy: asc(comment.createdAt),
            with: {
              author: true,
              likes: {
                where: eq(commentLike.userId, userId),
                columns: { userId: true, commentId: true },
              },
            },
          })
        : []

    const allComments = [...topLevel, ...replies]

    function buildTree(
      comments: CommentType[],
      parentId: string | null = null,
      depth = 0,
    ): CommentType[] {
      return comments
        .filter((c) => c.parentId === parentId)
        .map((c) => ({ ...c, depth, replies: buildTree(comments, c.id, depth + 1) }))
    }

    // @ts-expect-error missing replies/depth before buildTree adds them
    const commentTree = buildTree(allComments)

    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(comment)
      .where(and(eq(comment.chapterId, chapterId), isNull(comment.parentId)))

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return json({
      success: true,
      comments: commentTree,
      totalCount,
      totalPages,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    })
  } catch (err) {
    captureException(err)
    error(500, 'Failed To Fetch Comments')
  }
}
