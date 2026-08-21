import * as v from 'valibot'
import { containsRestrictedWord } from '$lib/utils'

// A cleared input arrives as '', not undefined — without this, clearing the
// field to remove an embed fails v.url()/v.picklist() instead of being
// treated as "no embed."
const emptyToUndefined = (value: string) => (value === '' ? undefined : value)

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export const schema = v.pipe(
  v.object({
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
    embedProvider: v.optional(
      v.pipe(
        v.string(),
        v.trim(),
        v.picklist(['spotify', 'apple-music'], 'Invalid embed provider selected.'),
      ),
    ),
    embedUrl: v.optional(
      v.pipe(
        v.string(),
        v.trim(),
        v.transform(emptyToUndefined),
        v.check((value) => value === undefined || isValidUrl(value), 'Please enter a valid URL.'),
      ),
    ),
    completed: v.optional(v.boolean(), false),
  }),
)

export { default as ChapterForm } from './chapter-form.svelte'
