import * as v from 'valibot'

import { containsRestrictedWord } from '$lib/utils'

export const schema = v.object({
	title: v.optional(
		v.pipe(
			v.string(),
			v.trim(),
			v.maxLength(200, 'Title must be 200 characters or fewer.'),
			v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
		),
	),
	content: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty('Please enter content.'),
		v.minLength(50, 'Chapter content must be at least 50 characters.'),
		v.maxLength(200_000, 'Chapter content must be 200,000 characters or fewer.'),
		v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
	),
	completed: v.optional(v.boolean(), false),
})

export { default as ChapterForm } from './chapter-form.svelte'
