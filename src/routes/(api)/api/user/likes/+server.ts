import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { desc, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { like } from '$lib/server/db/schema'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
import { storyWithForUser } from '$lib/server/helpers/story-helper'

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
  const userId = session.user.id

  try {
    const [likedRows, [{ count }]] = await Promise.all([
      db.query.like.findMany({
        where: eq(like.userId, userId),
        orderBy: desc(like.createdAt),
        limit,
        offset,
        with: {
          story: {
            with: storyWithForUser(userId),
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(like)
        .where(eq(like.userId, userId)),
    ])

    // Each row already maps 1:1 to a distinct story — `like`'s composite
    // PK (userId, storyId) guarantees no duplicates, so no grouping/dedup
    // step is needed here (unlike bookmarks, which dedups across chapters).
    const likes = likedRows.map((row) => ({
      ...row.story,
      latestLikedAt: row.createdAt,
    }))

    const hasNextPage = page * limit < count
    const next = hasNextPage ? page + 1 : null

    return json({ success: true, likes, count, next }, { status: 200 })
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
