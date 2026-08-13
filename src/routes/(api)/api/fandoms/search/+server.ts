import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { or, ilike, ne, and } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { fandom } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ url }) => {
  const query = url?.searchParams?.get('q') || ''
  const limit = parseInt(url.searchParams.get('limit') || '10')

  if (!query.length) {
    error(400, 'Bad Request')
  }

  try {
    const pattern = `%${query}%`

    const fandoms = await db
      .select({ id: fandom.id, slug: fandom.slug, name: fandom.name })
      .from(fandom)
      .where(
        and(
          ne(fandom.name, 'Original Content'),
          or(
            ilike(fandom.name, pattern),
            ilike(fandom.slug, pattern),
            ilike(fandom.description, pattern),
          ),
        ),
      )
      .limit(limit)

    const results = fandoms.map((f) => ({ label: f.name, value: f.id }))

    return json({ results, success: true }, { status: 200 })
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
