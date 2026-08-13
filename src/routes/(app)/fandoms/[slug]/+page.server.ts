import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { fandom } from '$lib/server/db/schema'

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug

  const fandomRow = await db.query.fandom.findFirst({
    where: eq(fandom.slug, slug),
    with: {
      category: { columns: { id: true, name: true, slug: true } },
    },
  })

  if (!fandomRow) {
    error(404, 'Not Found')
  }

  return { fandom: fandomRow }
}
