import { db } from '$lib/server/db'

export const notificationWith = {
  activity: {
    columns: { id: true, verb: true, createdAt: true },
    with: {
      actor: { columns: { id: true, username: true } },
      story: { columns: { id: true, title: true } },
      chapter: { columns: { id: true, title: true, chapterIndex: true, storyId: true } },
      comment: {
        columns: { id: true, content: true, parentId: true, chapterId: true },
        with: {
          chapter: { columns: { storyId: true } },
        },
      },
      targetUser: { columns: { id: true, username: true } },
    },
  },
} as const

export type NotificationWithActivity = Awaited<
  ReturnType<typeof db.query.notification.findMany<{ with: typeof notificationWith }>>
>[number]

// NOTE: fallback version, only if the above doesn't typecheck on the current Drizzle version

// declare const _sampleNotification: ReturnType
//   typeof db.query.notification.findMany<{ where: undefined; with: typeof notificationWith }>
// >
// export type NotificationWithActivity = Awaited<typeof _sampleNotification>[number]
