import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'

export const load: PageServerLoad = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    redirect(303, `/auth/sign-in?redirect=${encodeURIComponent('/fandoms/new')}`)
  }

  const categories = await db.query.category.findMany({
    columns: { id: true, name: true },
  })

  return { categories }
}
