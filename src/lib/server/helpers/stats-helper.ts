import { eq, sql } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { story } from '$lib/server/db/schema'

export interface AuthorStats {
  totalStories: number
  totalChapters: number
  totalLikes: number
  totalViews: number
  totalComments: number
  totalReadLaters: number
}

export async function getAuthorStats(authorId: string): Promise<AuthorStats> {
  const [row] = await db
    .select({
      totalStories: sql<number>`count(*)`.mapWith(Number),
      totalChapters: sql<number>`coalesce(sum(${story.chapterCount}), 0)`.mapWith(Number),
      totalLikes: sql<number>`coalesce(sum(${story.likeCount}), 0)`.mapWith(Number),
      totalViews: sql<number>`coalesce(sum(${story.viewCount}), 0)`.mapWith(Number),
      totalComments: sql<number>`coalesce(sum(${story.commentCount}), 0)`.mapWith(Number),
      totalReadLaters: sql<number>`coalesce(sum(${story.readLaterCount}), 0)`.mapWith(Number),
    })
    .from(story)
    .where(eq(story.authorId, authorId))

  return row
}
