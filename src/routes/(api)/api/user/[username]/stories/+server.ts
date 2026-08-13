import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { desc, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { user, story } from '$lib/server/db/schema'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
import { storyWithForUser } from '$lib/server/helpers/story-helper'

export const GET: RequestHandler = async ({ params, url, request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  const username = params.username

  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    error(400, 'Invalid pagination params')
  }

  const offset = (page - 1) * limit
  const userId = session?.user?.id ?? ''

  try {
    const targetUser = await db.query.user.findFirst({
      where: eq(user.username, username),
      columns: { id: true },
    })

    if (!targetUser) {
      error(404, 'Not Found')
    }

    const [stories, [{ count: totalCount }]] = await Promise.all([
      db.query.story.findMany({
        where: eq(story.authorId, targetUser.id),
        orderBy: desc(story.createdAt),
        limit,
        offset,
        with: storyWithForUser(userId),
      }),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(story)
        .where(eq(story.authorId, targetUser.id)),
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages
    const nextPage = hasMore ? page + 1 : null

    return json(
      {
        success: true,
        stories,
        totalCount,
        currentPage: page,
        nextPage,
        totalPages,
        hasMore,
      },
      { status: 200 },
    )
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
