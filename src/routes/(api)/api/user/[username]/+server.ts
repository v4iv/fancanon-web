import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { user, story, follow } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id ?? ''

  const targetUser = await db.query.user.findFirst({
    where: eq(user.username, params.username),
    with: {
      // "followers" here = follow rows where this user is the followee,
      // filtered to just the current session user's row (if any) to
      // answer "does the viewer follow this profile?"
      followers: {
        where: eq(follow.followerId, userId),
        columns: { followerId: true, followeeId: true },
      },
    },
  })

  if (!targetUser) {
    error(404, 'Not Found')
  }

  try {
    const [{ storyCount, followingCount, followersCount }] = await db
      .select({
        storyCount:
          sql<number>`(select count(*) from ${story} where ${story.authorId} = ${targetUser.id})`.mapWith(
            Number,
          ),
        followingCount:
          sql<number>`(select count(*) from ${follow} where ${follow.followerId} = ${targetUser.id})`.mapWith(
            Number,
          ),
        followersCount:
          sql<number>`(select count(*) from ${follow} where ${follow.followeeId} = ${targetUser.id})`.mapWith(
            Number,
          ),
      })
      .from(sql`(select 1) as _dummy`)

    return json(
      { success: true, user: targetUser, storyCount, followingCount, followersCount },
      { status: 200 },
    )
  } catch (err) {
    captureException(err)
    error(500, 'Something went wrong!')
  }
}
