import * as v from 'valibot'

import { containsRestrictedWord } from '$lib/utils'
import {
  ContentRating,
  Languages,
  NO_WARNING_CHOSEN_TAG_NAME,
  RELATIONSHIP_SEPARATOR,
} from '$lib/constants'

function jsonArraySchema<TItem extends v.GenericSchema>(itemSchema: TItem, maxItems = 30) {
  return v.pipe(
    v.string(),
    v.rawTransform(({ dataset, addIssue, NEVER }) => {
      try {
        const parsed = JSON.parse(dataset.value)
        if (!Array.isArray(parsed)) {
          addIssue({ message: 'Expected a JSON-encoded array' })
          return NEVER
        }
        return parsed
      } catch {
        addIssue({ message: 'Invalid JSON in tags field' })
        return NEVER
      }
    }),
    v.array(itemSchema),
    v.maxLength(maxItems, `You can add at most ${maxItems} tags here.`),
  )
}

const relationshipTagSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(3, '[Relationships] Tag is too short'),
  v.maxLength(200, '[Relationships] Tag is too long'),
  v.check(
    (value) => RELATIONSHIP_SEPARATOR.test(value),
    '[Relationships] Use "/" for romantic pairings or "&" for platonic/familial relationships',
  ),
  v.check((value) => {
    const parts = value.split(RELATIONSHIP_SEPARATOR).map((p) => p.trim())
    return parts.length >= 2 && parts.every((p) => p.length > 0)
  }, '[Relationships] Each character name must be non-empty'),
)

const characterTagSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, '[Characters] Tag cannot be empty'),
  v.maxLength(100, '[Characters] Tag is too long'),
)

const freeformTagSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, '[Additional Tags] Tag cannot be empty'),
  v.maxLength(100, '[Additional Tags] Tag is too long'),
)

const warningTagsSchema = v.pipe(
  v.optional(v.array(v.string()), []),
  v.check(
    (tags) =>
      !(tags.includes(NO_WARNING_CHOSEN_TAG_NAME) && tags.length > 1) &&
      !(tags.includes('no warnings apply') && tags.some((t) => t !== 'no warnings apply')),
    '[Warnings] Cannot combine "no warnings" options with specific warnings',
  ),
)

export const schema = v.object({
  fandoms: v.optional(v.string(), '[]'),
  title: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Please enter your title.'),
    v.minLength(2, 'Title must be at least 2 characters.'),
    v.maxLength(200, 'Title must be 200 characters or fewer.'),
    v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
  ),
  description: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Please enter your description.'),
    v.minLength(10, 'Description must be at least 10 characters.'),
    v.maxLength(1000, 'Description must be 1000 characters or fewer.'),
    v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
  ),
  contentRating: v.enum(ContentRating, 'Please select a content rating.'),
  language: v.enum(Languages, 'Please select a language.'),
  relationshipTags: jsonArraySchema(relationshipTagSchema),
  characterTags: jsonArraySchema(characterTagSchema),
  freeformTags: jsonArraySchema(freeformTagSchema, 20),
  warningTags: warningTagsSchema,
  completed: v.optional(v.boolean(), false),
})

export type StorySchemaOutput = v.InferOutput<typeof schema>

export { default as StoryForm } from './story-form.svelte'
