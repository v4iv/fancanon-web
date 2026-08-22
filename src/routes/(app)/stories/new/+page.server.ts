import type { PageServerLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { createDb } from '$lib/server/db'
import { createAuth } from '$lib/server/auth'
import { tag } from '$lib/server/db/schema'
import { NO_WARNING_CHOSEN_TAG_NAME } from '$lib/constants'

export const load: PageServerLoad = async ({ platform, request }) => {
  if (!platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(platform.env)
  const auth = createAuth(db)

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    throw redirect(303, `/auth/sign-in?redirect=${encodeURIComponent('/stories/new')}`)
  }

  const warnings = await db.query.tag.findMany({
    where: eq(tag.type, 'WARNING'),
    columns: {
      name: true,
    },
  })

  return {
    warnings: warnings.filter((t) => t.name !== NO_WARNING_CHOSEN_TAG_NAME).map((t) => t.name),
  }
}
