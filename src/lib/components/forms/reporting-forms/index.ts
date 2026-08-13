import * as v from 'valibot'
import { COMMENT_REASONS, REASONS, USER_REASONS } from '$lib/constants'

const descriptionSchema = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty('A short description explaining the issue is required.'),
  v.minLength(50, 'Too short! Must be at least 50 characters.'),
  v.maxLength(2000, 'Description must be 2000 characters or fewer.'),
)

export const reportUserSchema = v.object({
  userId: v.pipe(v.string(), v.cuid2('Invalid user selected.')),
  reason: v.picklist(USER_REASONS, 'Please select a reason.'),
  description: descriptionSchema,
})

export const reportStorySchema = v.object({
  storyId: v.pipe(v.string(), v.cuid2('Invalid story selected.')),
  reason: v.picklist(REASONS, 'Please select a reason.'),
  description: descriptionSchema,
})

export const reportChapterSchema = v.object({
  storyId: v.pipe(v.string(), v.cuid2('Invalid story selected.')),
  chapterId: v.pipe(v.string(), v.cuid2('Invalid chapter selected.')),
  reason: v.picklist(REASONS, 'Please select a reason.'),
  description: descriptionSchema,
})

export const reportCommentSchema = v.object({
  chapterId: v.pipe(v.string(), v.cuid2('Invalid chapter selected.')),
  commentId: v.pipe(v.string(), v.cuid2('Invalid comment selected.')),
  reason: v.picklist(COMMENT_REASONS, 'Please select a reason.'),
  description: descriptionSchema,
})

export { default as ReportUserForm } from './report-user-form.svelte'
export { default as ReportStoryForm } from './report-story-form.svelte'
export { default as ReportCommentForm } from './report-comment-form.svelte'
export { default as ReportChapterForm } from './report-chapter-form.svelte'
