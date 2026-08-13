import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { feedItem } from '$lib/server/db/schema'
import { storyWithForUser } from '$lib/server/helpers/story-helper'
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

  const userId = session.user.id
  const offset = (page - 1) * limit

  try {
    const items = await db.query.feedItem.findMany({
      where: eq(feedItem.ownerId, userId),
      orderBy: (fi, { desc }) => desc(fi.createdAt),
      limit,
      offset,
      with: {
        activity: {
          columns: { id: true, verb: true, createdAt: true },
          with: {
            // activity.storyId is populated for both verbs (denormalized, same
            // reasoning as history.storyId — avoids a join through chapter for
            // CHAPTER_PUBLISHED). chapter is only present for CHAPTER_PUBLISHED.
            story: { with: storyWithForUser(userId) },
            chapter: { columns: { id: true, title: true, chapterIndex: true, createdAt: true } },
          },
        },
      },
    })

    const feed = items.map((item) => ({
      feedItemId: item.id,
      verb: item.activity.verb,
      createdAt: item.createdAt,
      seenAt: item.seenAt,
      story: item.activity.story,
      chapter: item.activity.chapter,
    }))

    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(feedItem)
      .where(eq(feedItem.ownerId, userId))

    const totalPages = Math.max(1, Math.ceil(totalCount / limit))
    const hasMore = page < totalPages
    const nextPage = hasMore ? page + 1 : null

    return json(
      {
        success: true,
        feed,
        currentPage: page,
        next: nextPage,
        totalPages,
        hasMore,
      },
      { status: 200 },
    )
  } catch (err) {
    captureException(err)
    error(500, 'Something Went Wrong!')
  }
}
