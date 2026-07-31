import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import * as Sentry from '@sentry/sveltekit'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { category, story, storyFandom, fandom } from '$lib/server/db/schema'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
import {
  buildStoryFilterSql,
  getRankedStories,
  hydrateRankedStories,
} from '$lib/server/helpers/feed-helper'

export const GET: RequestHandler = async ({ params, url, request }) => {
  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)
  const languages = url.searchParams.getAll('languages')
  const contentRating = url.searchParams.getAll('contentRating')
  const completion = url.searchParams.get('completion')
  const slug = params.slug

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return json({ message: 'Invalid pagination params' }, { status: 400 })
  }

  const categoryRow = await db.query.category.findFirst({
    where: eq(category.slug, slug),
    columns: { id: true },
  })
  if (!categoryRow) {
    return json({ message: 'Category not found' }, { status: 404 })
  }

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''
  const offset = (page - 1) * limit

  // stories whose fandom belongs to this category — merged across every
  // fandom in the category, ranked as one decay-sorted list (not grouped
  // or sorted per-fandom)
  const categoryExists = sql`EXISTS (
		SELECT 1 FROM story_fandom sf
		JOIN fandom f ON f.id = sf.fandom_id
		WHERE sf.story_id = ${story.id} AND f.category_id = ${categoryRow.id}
	)`

  const filterWhere = buildStoryFilterSql({ languages, contentRating, completion })
  const combinedWhere = filterWhere ? and(categoryExists, filterWhere) : categoryExists

  try {
    const hotRows = await getRankedStories({ extraWhere: combinedWhere, limit, offset })

    const sortedStories = await hydrateRankedStories(
      hotRows.map((r) => r.id),
      Object.fromEntries(hotRows.map((r) => [r.id, r.score])),
      userId,
    )

    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(distinct ${story.id})`.mapWith(Number) })
      .from(story)
      .innerJoin(storyFandom, eq(storyFandom.storyId, story.id))
      .innerJoin(fandom, eq(fandom.id, storyFandom.fandomId))
      .where(
        filterWhere
          ? and(eq(fandom.categoryId, categoryRow.id), filterWhere)
          : eq(fandom.categoryId, categoryRow.id),
      )

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
    Sentry.captureException(err)
    return json(
      { success: false, message: 'Something went wrong!' },
      { status: 500, statusText: 'internal server error' },
    )
  }
}
