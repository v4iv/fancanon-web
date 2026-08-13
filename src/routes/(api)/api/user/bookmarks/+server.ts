import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { bookmark, chapter, story } from '$lib/server/db/schema'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'

export const GET: RequestHandler = async ({ url, request }) => {
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)
  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    error(400, 'Invalid pagination params')
  }

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  const offset = (page - 1) * limit

  try {
    // Step 1: dedup at the DB level — one row per distinct bookmarked
    // story, ranked by the most recent bookmark within that story.
    // Pagination happens here, on stories, not on raw bookmark rows.
    const rankedStoryIds = await db
      .select({
        storyId: chapter.storyId,
        latestBookmarkAt: sql<Date>`max(${bookmark.createdAt})`.as('latest_bookmark_at'),
      })
      .from(bookmark)
      .innerJoin(chapter, eq(chapter.id, bookmark.chapterId))
      .where(eq(bookmark.userId, session.user.id))
      .groupBy(chapter.storyId)
      .orderBy(desc(sql`max(${bookmark.createdAt})`))
      .limit(limit)
      .offset(offset)

    if (rankedStoryIds.length === 0) {
      return json({ success: true, bookmarks: [], count: 0 }, { status: 200 })
    }

    const storyIds = rankedStoryIds.map((r) => r.storyId)
    const latestBookmarkMap = new Map(rankedStoryIds.map((r) => [r.storyId, r.latestBookmarkAt]))

    // Step 2: hydrate story + author for just this page's stories.
    const stories = await db.query.story.findMany({
      where: inArray(story.id, storyIds),
      columns: { id: true, title: true, description: true, createdAt: true, updatedAt: true },
      with: {
        author: { columns: { username: true } },
      },
    })

    // Step 3: fetch every bookmarked chapter belonging to these stories,
    // for this user — this is the per-story chapter list.
    const bookmarkedChapters = await db
      .select({
        storyId: chapter.storyId,
        chapterId: chapter.id,
        title: chapter.title,
        chapterIndex: chapter.chapterIndex,
      })
      .from(bookmark)
      .innerJoin(chapter, eq(chapter.id, bookmark.chapterId))
      .where(and(eq(bookmark.userId, session.user.id), inArray(chapter.storyId, storyIds)))

    const chaptersByStory = new Map<
      string,
      { id: string; title: string; chapterIndex: number | null }[]
    >()
    for (const c of bookmarkedChapters) {
      if (!chaptersByStory.has(c.storyId)) chaptersByStory.set(c.storyId, [])
      chaptersByStory
        .get(c.storyId)!
        .push({ id: c.chapterId, title: c.title, chapterIndex: c.chapterIndex })
    }

    const storyById = new Map(stories.map((s) => [s.id, s]))

    // Step 4: assemble in the same order rankedStoryIds already sorted by
    // (most recently bookmarked story first) — no re-sorting needed.
    const paginatedStories = storyIds
      .map((id) => {
        const s = storyById.get(id)
        if (!s) return null
        return {
          id: s.id,
          title: s.title,
          author: { username: s.author.username },
          description: s.description,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          latestBookmarkAt: latestBookmarkMap.get(id)!,
          chapters: chaptersByStory.get(id) ?? [],
        }
      })
      .filter((s) => s !== null)

    // Step 5: total distinct bookmarked-story count, for hasMore/pagination.
    const [{ count }] = await db
      .select({ count: sql<number>`count(distinct ${chapter.storyId})`.mapWith(Number) })
      .from(bookmark)
      .innerJoin(chapter, eq(chapter.id, bookmark.chapterId))
      .where(eq(bookmark.userId, session.user.id))

    const hasNextPage = page * limit < count
    const next = hasNextPage ? page + 1 : null

    return json({ success: true, bookmarks: paginatedStories, count, next }, { status: 200 })
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
