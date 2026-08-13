import type { RequestHandler } from './$types'
import { error, json } from '@sveltejs/kit'
import { desc, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { history } from '$lib/server/db/schema'
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
    const items = await db.query.history.findMany({
      where: eq(history.userId, userId),
      orderBy: desc(history.lastViewedAt),
      limit,
      offset,
      with: {
        chapter: {
          columns: { id: true, title: true, chapterIndex: true },
        },
        story: {
          columns: { id: true, title: true },
          with: {
            author: { columns: { id: true, username: true } },
          },
        },
      },
    })

    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(history)
      .where(eq(history.userId, userId))

    const totalPages = Math.max(1, Math.ceil(totalCount / limit))
    const hasMore = page < totalPages
    const nextPage = hasMore ? page + 1 : null

    return json(
      {
        success: true,
        history: items,
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

export const DELETE: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    await db.delete(history).where(eq(history.userId, session.user.id))

    return json({ success: true }, { status: 200 })
  } catch (err) {
    captureException(err)

    error(500, 'Something Went Wrong!')
  }
}
