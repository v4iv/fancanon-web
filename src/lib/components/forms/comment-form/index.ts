import * as v from 'valibot'

import { containsRestrictedWord } from '$lib/utils'

export const schema = v.object({
  content: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Please enter a comment.'),
    v.minLength(2, 'Comment is too short.'),
    v.maxLength(2000, 'Comment must be 2000 characters or fewer.'),
    v.check(
      (value) => !containsRestrictedWord(value),
      'Your comment contains prohibited language.',
    ),
  ),
  parentId: v.optional(v.pipe(v.string(), v.cuid2('Invalid parent comment.'))),
  chapterId: v.pipe(v.string(), v.cuid2('Invalid chapter.')),
})

export { default as CommentForm } from './comment-form.svelte'
