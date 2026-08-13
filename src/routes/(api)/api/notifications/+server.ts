import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { desc, eq, isNull, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { notification } from '$lib/server/db/schema'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
import { notificationWith } from '$lib/server/helpers/notification-helper'

export const GET: RequestHandler = async ({ url, request }) => {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    error(400, 'Invalid pagination params')
  }

  const offset = (page - 1) * limit

  try {
    const [notifications, counts] = await Promise.all([
      db.query.notification.findMany({
        where: eq(notification.ownerId, session.user.id),
        orderBy: desc(notification.createdAt),
        limit,
        offset,
        with: notificationWith,
      }),

      db
        .select({
          total: sql<number>`count(*)`.mapWith(Number),
          unseen: sql<number>`count(*) filter (where ${isNull(notification.seenAt)})`.mapWith(
            Number,
          ),
        })
        .from(notification)
        .where(eq(notification.ownerId, session.user.id)),
    ])

    const { total: totalCount, unseen: unseenCount } = counts[0]
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages
    const next = hasMore ? page + 1 : null

    return json(
      {
        success: true,
        notifications,
        unseenCount,
        totalCount,
        currentPage: page,
        next,
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
