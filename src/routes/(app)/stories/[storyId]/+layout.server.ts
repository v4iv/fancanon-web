import type { LayoutServerLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'
import { asc, eq } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { chapter, story } from '$lib/server/db/schema'

export const load: LayoutServerLoad = async ({ request, cookies, params, url }) => {
  const storyId = params.storyId
  const chapterIndex = params.chapterIndex
  const redirectPath = url.searchParams.get('redirect')

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  let result: any

  try {
    result = db.query.story.findFirst({
      where: eq(story.id, storyId),
      columns: {
        id: true,
        title: true,
        description: true,
        language: true,
        contentRating: true,
      },
      with: {
        author: { columns: { id: true, username: true } },
        chapters: {
          orderBy: asc(chapter.chapterIndex),
          columns: { id: true, title: true, chapterIndex: true },
        },
      },
    })
  } catch (err) {
    captureException(err)

    return error(500, 'Something went wrong!')
  }

  if (result?.contentRating === 'EXPLICIT') {
    const hasConsent = session?.user
      ? session.user.explicitConsentAt !== undefined && session.user.explicitConsentAt !== null
      : cookies.get('explicit-consent') === 'true'

    if (!hasConsent) {
      if (session?.user.id === result.author.id) {
        return { result }
      } else if (redirectPath) {
        throw redirect(303, `/consent?redirect=${redirectPath}`)
      } else if (chapterIndex) {
        throw redirect(303, `/consent?redirect=/stories/${storyId}/chapters/${chapterIndex}`)
      } else {
        throw redirect(303, `/consent?redirect=/stories/${storyId}`)
      }
    }
  }

  return { story: result }
}
