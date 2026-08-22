import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import { asc, eq, getTableColumns, sql } from 'drizzle-orm'

import { getDb } from '$lib/server/db'
import { category, fandom, storyFandom } from '$lib/server/db/schema'

export const load: PageServerLoad = async ({ platform, params }) => {
  const slug = params.slug

  if (!platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = getDb(platform.env)

  const categoryRow = await db.query.category.findFirst({
    where: eq(category.slug, slug),
  })

  if (!categoryRow) {
    error(404, 'Not Found')
  }

  const [fandoms, [{ count }]] = await Promise.all([
    db
      .select({
        ...getTableColumns(fandom),
        storyCount: sql<number>`count(${storyFandom.storyId})`.mapWith(Number),
      })
      .from(fandom)
      .leftJoin(storyFandom, eq(storyFandom.fandomId, fandom.id))
      .where(eq(fandom.categoryId, categoryRow.id))
      .groupBy(fandom.id)
      .orderBy(asc(fandom.name)),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(fandom)
      .where(eq(fandom.categoryId, categoryRow.id)),
  ])

  return { category: categoryRow, fandoms, count }
}
