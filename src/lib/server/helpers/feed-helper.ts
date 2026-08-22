import { eq } from 'drizzle-orm'

import type { DatabaseType } from '$lib/server/db'
import { activity, feedItem, follow } from '$lib/server/db/schema'

export async function fanoutActivity(db: DatabaseType, activityId: string) {
  const activityRow = await db.query.activity.findFirst({
    where: eq(activity.id, activityId),
  })

  if (!activityRow) {
    throw new Error(`fanoutActivity: activity ${activityId} not found`)
  }

  const followers = await db
    .select({ followerId: follow.followerId })
    .from(follow)
    .where(eq(follow.followeeId, activityRow.actorId))

  if (followers.length === 0) return

  await db
    .insert(feedItem)
    .values(
      followers.map((f) => ({
        ownerId: f.followerId,
        activityId: activityRow.id,
        createdAt: activityRow.createdAt,
      })),
    )
    .onConflictDoNothing()
}
