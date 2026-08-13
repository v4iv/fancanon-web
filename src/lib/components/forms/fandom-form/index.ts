import * as v from 'valibot'

import { containsRestrictedWord } from '$lib/utils'

// const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const schema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Please enter a name.'),
    v.minLength(2, 'Name must be at least 2 characters.'),
    v.maxLength(100, 'Name must be 100 characters or fewer.'),
    v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
  ),
  // slug: v.pipe(
  // 	v.string(),
  // 	v.trim(),
  // 	v.toLowerCase(),
  // 	v.nonEmpty('Please enter a slug.'),
  // 	v.minLength(2, 'Slug must be at least 2 characters.'),
  // 	v.maxLength(100, 'Slug must be 100 characters or fewer.'),
  // 	v.regex(
  // 		SLUG_PATTERN,
  // 		'Slug can only contain lowercase letters, numbers, and hyphens (no leading/trailing/double hyphens).',
  // 	),
  // 	v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
  // ),
  description: v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(1000, 'Description must be 1000 characters or fewer.'),
    v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
  ),
  category: v.pipe(
    v.string(),
    v.nonEmpty('Please select a category.'),
    v.cuid2('Invalid category selected.'),
  ),
})

export { default as FandomForm } from './fandom-form.svelte'
