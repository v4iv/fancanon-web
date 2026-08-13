import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { and, asc, desc, eq, inArray, or, sql, type SQL } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  SIMILARITY_THRESHOLD,
  WORD_SIMILARITY_THRESHOLD,
} from '$lib/constants'
import { story, tag } from '$lib/server/db/schema'
import { storyWithForUser } from '$lib/server/helpers/story-helper'

// Trigram thresholds, scoped per-request via SET LOCAL (see the transaction
// below) since the `%`/`<%` operators read these from session config, not
// from a literal passed in the query itself. Lower = more typo-tolerant,
// more false positives. Tune these two independently of each other.

export const GET: RequestHandler = async ({ url, request }) => {
  const page = parseInt(url.searchParams.get('page') || `${DEFAULT_PAGE}`)
  const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`)
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    error(400, 'Invalid pagination params')
  }

  const sort = url.searchParams.get('sort') || 'relevance'
  const query = (url.searchParams.get('q') ?? '').trim()
  const languages = url.searchParams.getAll('languages')
  const ratings = url.searchParams.getAll('ratings')
  const completion = url.searchParams.get('completion')
  const offset = (page - 1) * limit

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''

  if (query.length < 3) {
    return json({
      stories: [],
      totalCount: 0,
      totalPages: 1,
      nextPage: null,
      hasMore: false,
      currentPage: 1,
    })
  }

  // websearch_to_tsquery parses raw search-box input directly — punctuation,
  // quotes, "-exclude", etc. are handled internally, so no manual
  // sanitization is needed and no syntax errors are possible. Bare words are
  // ANDed together (must all match), unlike the old hand-rolled `term | term`
  // string which ORed them — AND narrows the candidate set faster against the
  // GIN index, and the trigram fuzzy matching below picks up looser/typo'd
  // cases this won't catch.
  const tsQuery = sql`websearch_to_tsquery('english', ${query})`

  // Plain query text, reused across every trigram comparison below.

  let fandomIds: string[] = []
  try {
    const parsed = JSON.parse(url.searchParams.get('fandoms') || '[]')
    fandomIds = Array.isArray(parsed) ? parsed.map((f: { value: string }) => f.value) : []
  } catch {
    error(400, 'Invalid fandoms param')
  }

  // includeTags: story must have ALL of these tags.
  // excludeTags: story must have NONE of these tags.
  let includeTagIds: string[] = []
  let excludeTagIds: string[] = []
  try {
    const parsed = JSON.parse(url.searchParams.get('includeTags') || '[]')
    includeTagIds = Array.isArray(parsed) ? parsed.map((t: { value: string }) => t.value) : []
  } catch {
    error(400, 'Invalid includeTags param')
  }
  try {
    const parsed = JSON.parse(url.searchParams.get('excludeTags') || '[]')
    excludeTagIds = Array.isArray(parsed) ? parsed.map((t: { value: string }) => t.value) : []
  } catch {
    error(400, 'Invalid excludeTags param')
  }
  // A tag can't be both required and forbidden — if the client sends an
  // overlap, include wins and the contradiction is dropped from exclude.
  if (includeTagIds.length > 0 && excludeTagIds.length > 0) {
    const includeSet = new Set(includeTagIds)
    excludeTagIds = excludeTagIds.filter((id) => !includeSet.has(id))
  }

  try {
    // Everything that touches trigram similarity — the tag lookup, and the
    // two story queries below — runs inside one transaction so SET LOCAL
    // applies consistently to all of it and can't leak onto other requests
    // sharing the connection pool.
    const [stories, [{ count: totalCount }]] = await db.transaction(async (tx) => {
      await tx.execute(
        sql.raw(`SET LOCAL pg_trgm.word_similarity_threshold = ${WORD_SIMILARITY_THRESHOLD}`),
      )
      await tx.execute(sql.raw(`SET LOCAL pg_trgm.similarity_threshold = ${SIMILARITY_THRESHOLD}`))

      // Tag name matching: fuzzy similarity (%) instead of ILIKE, so a
      // typo'd tag name in the free-text query box still surfaces the tag's
      // stories.
      const tagMatches = await tx
        .select({ id: tag.id })
        .from(tag)
        .where(sql`${tag.name} % ${query}`)
      const tagMatchIds = tagMatches.map((t) => t.id)

      // title/description match: exact-ish full-text OR typo-tolerant word
      // similarity. word_similarity (<%) is used instead of similarity (%)
      // here because title/description are long-form text and we're
      // checking whether the query resembles *some* word within them, not
      // the whole string.
      const titleDescMatch = sql`(
				to_tsvector('english', ${story.title} || ' ' || coalesce(${story.description}, '')) @@ ${tsQuery}
				OR ${query} <% ${story.title}
				OR ${query} <% coalesce(${story.description}, '')
			)`

      // author username/name match, via EXISTS against user — same
      // full-text + fuzzy combination as titleDescMatch.
      const authorMatch = sql`EXISTS (
				SELECT 1 FROM "user" u
				WHERE u.id = ${story.authorId}
				AND (
					to_tsvector('english', coalesce(u.username, '') || ' ' || coalesce(u.name, '')) @@ ${tsQuery}
					OR ${query} <% coalesce(u.username, '')
					OR ${query} <% coalesce(u.name, '')
				)
			)`

      const searchConditions = [titleDescMatch, authorMatch]
      if (tagMatchIds.length > 0) {
        searchConditions.push(sql`EXISTS (
					SELECT 1 FROM story_tag st
					WHERE st.story_id = ${story.id} AND st.tag_id IN ${tagMatchIds}
				)`)
      }

      const filters: SQL[] = [or(...searchConditions)!]
      if (fandomIds.length > 0) {
        filters.push(sql`EXISTS (
					SELECT 1 FROM story_fandom sf
					WHERE sf.story_id = ${story.id} AND sf.fandom_id IN ${fandomIds}
				)`)
      }
      if (includeTagIds.length > 0) {
        // Story must carry every requested tag, not just one of them —
        // count distinct matches against the requested set and require
        // full coverage.
        filters.push(sql`(
					SELECT COUNT(DISTINCT st.tag_id) FROM story_tag st
					WHERE st.story_id = ${story.id} AND st.tag_id IN ${includeTagIds}
				) = ${includeTagIds.length}`)
      }
      if (excludeTagIds.length > 0) {
        filters.push(sql`NOT EXISTS (
					SELECT 1 FROM story_tag st
					WHERE st.story_id = ${story.id} AND st.tag_id IN ${excludeTagIds}
				)`)
      }
      if (languages.length > 0) {
        filters.push(inArray(story.language, languages))
      }
      if (completion === 'completed') {
        filters.push(eq(story.completed, true))
      } else if (completion === 'ongoing') {
        filters.push(eq(story.completed, false))
      }
      if (ratings.length > 0) {
        filters.push(
          inArray(
            story.contentRating,
            ratings as (typeof story.contentRating.enumValues)[number][],
          ),
        )
      }

      const where = and(...filters)

      // Blend exact/stemmed rank with trigram similarity so typo-only
      // matches (ts_rank = 0, since to_tsquery found no lexeme match) still
      // rank above zero instead of being indistinguishable from a
      // non-match under 'relevance' sort. This is a simple heuristic, not
      // a calibrated score — GREATEST just lets whichever signal fired
      // harder win.
      const relevanceRank = sql`GREATEST(
				ts_rank(to_tsvector('english', ${story.title} || ' ' || coalesce(${story.description}, '')), ${tsQuery}),
				similarity(${story.title}, ${query})
			)`

      let orderBy
      switch (sort) {
        case 'oldest':
          orderBy = asc(story.createdAt)
          break
        case 'newest':
          orderBy = desc(story.createdAt)
          break
        case 'relevance':
        default:
          orderBy = desc(relevanceRank)
          break
      }

      return Promise.all([
        tx.query.story.findMany({
          where,
          orderBy,
          limit,
          offset,
          with: storyWithForUser(userId),
        }),
        tx
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(story)
          .where(where),
      ])
    })

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages
    const nextPage = hasMore ? page + 1 : null

    return json({ stories, totalCount, currentPage: page, nextPage, totalPages, hasMore })
  } catch (err) {
    captureException(err)

    error(500, 'Something went wrong!')
  }
}
