import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { and, asc, desc, eq, ilike } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { tag, tagTypeEnum } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ url }) => {
  const q = (url.searchParams.get('q') ?? '').trim()
  const type = url.searchParams.get('type')

  if (q.length === 0) {
    return json([])
  }

  if (!type || !tagTypeEnum.enumValues.includes(type as (typeof tagTypeEnum.enumValues)[number])) {
    error(400, 'Invalid or missing tag type')
  }

  try {
    const tags = await db
      .select({ name: tag.name, usageCount: tag.usageCount })
      .from(tag)
      .where(
        and(
          eq(tag.type, type as (typeof tagTypeEnum.enumValues)[number]),
          ilike(tag.name, `%${q}%`),
        ),
      )
      .orderBy(desc(tag.usageCount), asc(tag.name))
      .limit(10)

    return json(tags.map((t) => t.name))
  } catch (err) {
    captureException(err)

    error(500, 'Something went wrong!')
  }
}
