import type { TagType, ContentRating } from '$lib/generated/prisma/enums'

export type ContentRating = keyof typeof ContentRating

export type StoryType = {
  id: string
  title: string
  description?: string | null
  author: {
    id: string
    username: string | null
  }
  language: string
  contentRating: ContentRating
  completed: boolean
  wordCount: number
  likeCount: number
  viewCount: number
  chapterCount: number
  commentCount: number
  readLaterCount: number
  tags: {
    tag: {
      id: string
      name: string
      slug: string
      type: TagType
    }
  }[]
  fandoms: {
    fandom: {
      id: string
      name: string
      slug: string
    }
  }[]
  likes: {
    storyId: string
    userId: string
  }[]
  readLaters: {
    storyId: string
    userId: string
  }[]
  createdAt: Date
}

export type SessionUserType = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  image?: string | null | undefined | undefined
  username?: string | null | undefined
  displayUsername?: string | null | undefined
}

export type CommentType = {
  author: {
    name: string | null
    id: string
    email: string
    username: string | null
    displayUsername: string | null
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
  }
  likes: {
    createdAt: Date
    userId: string
    commentId: string
  }[]
  _count: {
    likes: number
  }
} & {
  content: string
  chapterId: string
  parentId: string | null
  id: string
  replies: CommentType[]
  depth: number
  createdAt: Date
  updatedAt: Date
  authorId: string
  likeCount: number
  replyCount: number
}

export type StoryTagWithTag = { tag: { name: string; slug: string; type: string } }
