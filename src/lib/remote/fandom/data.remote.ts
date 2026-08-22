import { error } from '@sveltejs/kit'
import { form, getRequestEvent } from '$app/server'
import slug from 'slug'
import { captureException } from '@sentry/sveltekit'

import { createDb } from '$lib/server/db'
import { createAuth } from '$lib/server/auth'
import { fandom } from '$lib/server/db/schema'
import { schema as createFandomSchema } from '$lib/components/forms/fandom-form'

slug.charmap['/'] = '-'
slug.charmap['&'] = '-'
slug.charmap['('] = '-'

export const createNewFandom = form(createFandomSchema, async (data) => {
  const event = getRequestEvent()

  if (!event.platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(event.platform.env)
  const auth = createAuth(db)

  const session = await auth.api.getSession({ headers: getRequestEvent().request.headers })
  if (!session?.user) {
    error(401, 'Unauthorized')
  }

  try {
    const [createdFandom] = await db
      .insert(fandom)
      .values({
        createdById: session.user.id,
        name: data.name,
        slug: slug(data.name),
        description: data.description,
        categoryId: data.category,
      })
      .returning()

    return { success: true, message: 'Fandom create successful!', fandom: createdFandom }
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === '23505') {
      error(409, 'A fandom with this name already exists')
    }
    captureException(err)

    error(500, 'Unexpected Error')
  }
})
