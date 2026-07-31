import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { desc, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
import { story, like, readLater } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ url, request }) => {
  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    error(400, 'Invalid pagination params')
  }

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''
  const offset = (page - 1) * limit

  try {
    const latest = await db.query.story.findMany({
      orderBy: desc(story.createdAt),
      limit,
      offset,
      with: {
        author: { columns: { id: true, username: true } },
        tags: {
          columns: {},
          with: { tag: { columns: { id: true, name: true, slug: true, type: true } } },
        },
        fandoms: {
          columns: {},
          with: { fandom: { columns: { id: true, name: true, slug: true } } },
        },
        likes: {
          where: eq(like.userId, userId),
          columns: { userId: true, storyId: true },
        },
        readLaters: {
          where: eq(readLater.userId, userId),
          columns: { userId: true, storyId: true },
        },
      },
    })

    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(story)

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages
    const nextPage = hasMore ? page + 1 : null

    return json(
      { success: true, stories: latest, currentPage: page, next: nextPage, totalPages, hasMore },
      { status: 200 },
    )
  } catch (err) {
    captureException(err)

    error(500, 'Something Went Wrong!')
  }
}
