import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { captureException } from '@sentry/sveltekit'
import { eq } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import type { CommentType } from '$lib/types'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
import { comment, commentLike } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ params, url, request }) => {
  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)
  const chapterId = params.chapterId

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''

  try {
    // Fetch *all* comments for the chapter (needed to build the tree)
    const allComments = await db.query.comment.findMany({
      where: eq(comment.chapterId, chapterId),
      orderBy: (c, { asc }) => asc(c.createdAt),
      with: {
        author: true,
        likes: {
          where: eq(commentLike.userId, userId),
          columns: { userId: true, commentId: true },
        },
      },
    })

    if (allComments.length === 0) {
      return json(
        {
          success: true,
          comments: [],
          totalCount: 0,
          totalPages: 0,
          hasMore: false,
        },
        { status: 200 },
      )
    }

    // Recursive function to build infinite reply tree
    function buildTree(
      comments: CommentType[],
      parentId: string | null = null,
      depth: number = 0,
    ): CommentType[] {
      return comments
        .filter((c) => c.parentId === parentId)
        .map((c) => ({
          ...c,
          depth,
          replies: buildTree(comments, c.id, depth + 1),
        }))
    }

    // Build full tree
    // @ts-expect-error because allComments is missing replies and depth
    const commentTree = buildTree(allComments)

    // Paginate *only* top-level comments
    const totalCount = commentTree.length
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages
    const nextPage = hasMore ? page + 1 : null
    const paginatedTopLevel = commentTree.slice((page - 1) * limit, page * limit)

    return json(
      {
        success: true,
        comments: paginatedTopLevel,
        totalCount,
        totalPages,
        hasMore,
        nextPage,
      },
      { status: 200 },
    )
  } catch (err) {
    captureException(err)
    error(500, 'Failed To Fetch Comments')
  }
}
