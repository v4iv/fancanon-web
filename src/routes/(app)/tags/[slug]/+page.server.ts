import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { getDb } from '$lib/server/db'
import { tag } from '$lib/server/db/schema'

export const load: PageServerLoad = async ({ platform, params }) => {
  const slug = params.slug

  if (!platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = getDb(platform.env)

  const tagRow = await db.query.tag.findFirst({
    where: eq(tag.slug, slug),
    with: {
      synonyms: true,
    },
  })

  if (!tagRow) {
    error(404, 'Not Found')
  }

  return {
    tag: tagRow,
  }
}
