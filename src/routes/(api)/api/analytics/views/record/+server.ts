import type { RequestHandler } from './$types'
import { json } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { captureException } from '@sentry/sveltekit'

import { db } from '$lib/server/db'
import { auth } from '$lib/server/auth'
import { chapter, story, history } from '$lib/server/db/schema'
import { VIEW_DEDUP_WINDOW_SECONDS } from '$lib/constants'

export const POST: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })
  const { cid, sid, viewed }: { cid: string; sid: string; viewed: Record<string, number> } =
    await request.json()

  try {
    // Aggregate counter — soft dedup via the client-supplied "last
    // seen" hint. Only decides whether to bump the public count.
    const lastViewed = viewed?.[cid]
    const alreadyCountedRecently =
      lastViewed && Date.now() - lastViewed < VIEW_DEDUP_WINDOW_SECONDS * 1000

    if (!alreadyCountedRecently) {
      await db.transaction(async (tx) => {
        await tx
          .update(chapter)
          .set({ viewCount: sql`${chapter.viewCount} + 1` })
          .where(eq(chapter.id, cid))
        await tx
          .update(story)
          .set({ viewCount: sql`${story.viewCount} + 1` })
          .where(eq(story.id, sid))
      })
    }

    // History — deliberately NOT gated by alreadyCountedRecently. A
    // user who read this anonymously, then logged in and revisits it,
    // still needs a history row now — the counter's dedup window has
    // nothing to do with whether THIS user has a history entry.
    if (session?.user) {
      await db
        .insert(history)
        .values({ userId: session.user.id, chapterId: cid, storyId: sid, lastViewedAt: new Date() })
        .onConflictDoUpdate({
          target: [history.userId, history.chapterId],
          set: { lastViewedAt: new Date() },
        })
    }

    return json({ success: true })
  } catch (err) {
    captureException(err)
    return json({ success: true })
  }
}
