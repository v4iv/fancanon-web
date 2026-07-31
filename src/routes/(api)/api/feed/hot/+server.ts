import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { eq, inArray, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { story, like, readLater } from '$lib/server/db/schema'
import { getRankedStories } from '$lib/server/helpers/feed-helper'
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  LIKES_WEIGHT,
  READ_LATER_WEIGHT,
  TRENDING_GRAVITY,
} from '$lib/constants'

// TODO: cap how far pagination goes, either in the frontend
// (don't render a "next" control past some reasonable page count) or add a
// hard LIMIT ceiling server-side (e.g. never serve past page 20 regardless of totalCount)
export const GET: RequestHandler = async ({ url, request }) => {
  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return json({ message: 'Invalid pagination params' }, { status: 400 })
  }

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''
  const offset = (page - 1) * limit

  try {
    // rank = score / (age_in_hours + 2) ^ gravity — Hacker-News-style decay.
    // No hard time cutoff: a story that goes viral weeks after publishing
    // can still surface, decay alone determines what's "hot" right now.
    const weightedScore = sql`(${story.likeCount} * ${LIKES_WEIGHT} + ${story.readLaterCount} * ${READ_LATER_WEIGHT})`

    const rankedStories = await getRankedStories({
      scoreSql: weightedScore,
      gravity: TRENDING_GRAVITY,
      limit,
      offset,
    })

    if (rankedStories.length === 0) {
      return json({
        success: true,
        stories: [],
        currentPage: page,
        next: null,
        totalPages: 1,
        hasMore: false,
      })
    }

    const storyIds = rankedStories.map((s) => s.id)
    const scoreMap = Object.fromEntries(rankedStories.map((s) => [s.id, s.score]))

    const stories = await db.query.story.findMany({
      where: inArray(story.id, storyIds),
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

    const storyMap = new Map(stories.map((s) => [s.id, s]))
    const sortedStories = storyIds
      .map((id) => {
        const s = storyMap.get(id)
        return s ? { ...s, score: scoreMap[id] } : null
      })
      .filter((s) => s !== null)

    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(story)

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages
    const nextPage = hasMore ? page + 1 : null

    return json(
      {
        success: true,
        stories: sortedStories,
        currentPage: page,
        next: nextPage,
        totalPages,
        hasMore,
      },
      { status: 200 },
    )
  } catch (err) {
    captureException(err)
    return json(
      { success: false, message: 'Something went wrong!' },
      { status: 500, statusText: 'internal server error' },
    )
  }
}
