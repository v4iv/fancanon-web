import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { and, desc, asc, eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import {
  buildStoryFilterSql,
  getRankedStories,
  hydrateRankedStories,
} from '$lib/server/helpers/feed-helper'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
import { story, tag } from '$lib/server/db/schema'
import { storyWithForUser } from '$lib/server/helpers/story-helper'

export const GET: RequestHandler = async ({ params, url, request }) => {
  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)
  const sort = url.searchParams.get('sort') || 'new'
  const languages = url.searchParams.getAll('languages')
  const contentRating = url.searchParams.getAll('contentRating')
  const completion = url.searchParams.get('completion')
  const slug = params.slug

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    error(400, 'Invalid pagination params')
  }

  if (!['hot', 'new', 'old'].includes(sort)) {
    error(400, 'Invalid sort')
  }

  const tagRow = await db.query.tag.findFirst({
    where: eq(tag.slug, slug),
    columns: { id: true },
  })

  if (!tagRow) {
    error(404, 'Tag Not Found')
  }

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''
  const offset = (page - 1) * limit

  const tagExists = sql`EXISTS (
		SELECT 1 FROM story_tag st
		WHERE st.story_id = ${story.id} AND st.tag_id = ${tagRow.id}
	)`

  const filterWhere = buildStoryFilterSql({ languages, contentRating, completion })
  const combinedWhere = filterWhere ? and(tagExists, filterWhere) : tagExists

  try {
    let sortedStories

    if (sort === 'hot') {
      const hotRows = await getRankedStories({ extraWhere: combinedWhere, limit, offset })

      sortedStories = await hydrateRankedStories(
        hotRows.map((r) => r.id),
        Object.fromEntries(hotRows.map((r) => [r.id, r.score])),
        userId,
      )
    } else {
      sortedStories = await db.query.story.findMany({
        where: combinedWhere,
        orderBy: sort === 'old' ? asc(story.createdAt) : desc(story.createdAt),
        limit,
        offset,
        with: storyWithForUser(userId),
      })
    }

    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(story)
      .where(combinedWhere)

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages
    const nextPage = hasMore ? page + 1 : null

    return json(
      {
        success: true,
        stories: sortedStories,
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
