import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { desc, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { comment } from '$lib/server/db/schema'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'

export const GET: RequestHandler = async ({ url, request }) => {
  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    error(400, 'Invalid pagination params')
  }

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  const offset = (page - 1) * limit

  try {
    const [comments, [{ count }]] = await Promise.all([
      db.query.comment.findMany({
        where: eq(comment.authorId, session.user.id),
        orderBy: desc(comment.createdAt),
        limit,
        offset,
        with: {
          parent: {
            columns: {},
            with: {
              author: { columns: { id: true, username: true, image: true } },
            },
          },
          chapter: {
            columns: { title: true, chapterIndex: true },
            with: {
              story: { columns: { id: true, title: true } },
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(comment)
        .where(eq(comment.authorId, session.user.id)),
    ])

    const hasNextPage = page * limit < count
    const next = hasNextPage ? page + 1 : null

    return json({ success: true, comments, next }, { status: 200 })
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
