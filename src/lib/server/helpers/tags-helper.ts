import slug from 'slug'
import { and, eq, inArray, sql } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { tag, storyTag } from '$lib/server/db/schema'
import { NO_WARNING_CHOSEN_TAG_NAME } from '$lib/constants'

slug.charmap['/'] = '-'
slug.charmap['&'] = '-'

type DbTransaction = Parameters<Parameters<(typeof db)['transaction']>[0]>[0]
type DbOrTx = typeof db | DbTransaction
type TagType = (typeof tag.type.enumValues)[number]

async function resolveWarningTags(client: DbOrTx, warningNames: string[]) {
  const names = warningNames.length > 0 ? warningNames : [NO_WARNING_CHOSEN_TAG_NAME]
  // warnings are admin-seeded only — select, never insert here
  const tags = await client
    .select({ id: tag.id })
    .from(tag)
    .where(and(inArray(tag.name, names), eq(tag.type, 'WARNING')))
  return tags.map((t) => t.id)
}

async function resolveTags(client: DbOrTx, tagNames: string[], type: TagType) {
  const normalized = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))]
  if (normalized.length === 0) return []

  // one batched insert, skip any that already exist by unique `name` —
  // replaces N-upserts-in-a-Promise.all, which was the source of the
  // original transaction timeout: each upsert was its own round-trip
  await client
    .insert(tag)
    .values(normalized.map((name) => ({ name, slug: slug(name), type })))
    .onConflictDoNothing({ target: [tag.name] })

  // one more round-trip to fetch ids for both newly-created and
  // pre-existing tags
  const tags = await client.select({ id: tag.id }).from(tag).where(inArray(tag.name, normalized))

  return tags.map((t) => t.id)
}

type ResolvedTagIds = {
  relationshipIds: string[]
  characterIds: string[]
  freeformIds: string[]
  warningIds: string[]
}

/**
 * Resolves tag names -> tag ids. Runs against the plain client, NOT inside
 * a transaction — tag resolution is idempotent (tag.name is unique, so
 * concurrent insert+onConflictDoNothing calls are race-safe on their own)
 * and has no correctness dependency on the story row existing yet. Keeping
 * this outside the transaction is what keeps the actual transaction short.
 */
export async function resolveStoryTagIds(tags: {
  relationshipTags: string[]
  characterTags: string[]
  freeformTags: string[]
  warningTags: string[]
}): Promise<ResolvedTagIds> {
  const [relationshipIds, characterIds, freeformIds, warningIds] = await Promise.all([
    resolveTags(db, tags.relationshipTags, 'RELATIONSHIP'),
    resolveTags(db, tags.characterTags, 'CHARACTER'),
    resolveTags(db, tags.freeformTags, 'FREEFORM'),
    resolveWarningTags(db, tags.warningTags),
  ])
  return { relationshipIds, characterIds, freeformIds, warningIds }
}

/** Call after resolveStoryTagIds, inside the transaction, for a brand-new story. */
export async function createStoryTagLinks(
  tx: DbTransaction,
  storyId: string,
  resolved: ResolvedTagIds,
) {
  const allTagIds = [
    ...resolved.relationshipIds,
    ...resolved.characterIds,
    ...resolved.freeformIds,
    ...resolved.warningIds,
  ]

  if (allTagIds.length > 0) {
    await tx
      .insert(storyTag)
      .values(allTagIds.map((tagId) => ({ storyId, tagId })))
      .onConflictDoNothing({ target: [storyTag.storyId, storyTag.tagId] })

    await tx
      .update(tag)
      .set({ usageCount: sql`${tag.usageCount} + 1` })
      .where(inArray(tag.id, allTagIds))
  }
}

/** Call after resolveStoryTagIds, inside the transaction, for an edited story. */
export async function syncStoryTagLinks(
  tx: DbTransaction,
  storyId: string,
  resolved: ResolvedTagIds,
) {
  const desiredTagIds = new Set([
    ...resolved.relationshipIds,
    ...resolved.characterIds,
    ...resolved.freeformIds,
    ...resolved.warningIds,
  ])

  const existing = await tx
    .select({ tagId: storyTag.tagId })
    .from(storyTag)
    .where(eq(storyTag.storyId, storyId))
  const existingTagIds = new Set(existing.map((st) => st.tagId))

  const toAdd = [...desiredTagIds].filter((id) => !existingTagIds.has(id))
  const toRemove = [...existingTagIds].filter((id) => !desiredTagIds.has(id))

  if (toRemove.length > 0) {
    await tx
      .delete(storyTag)
      .where(and(eq(storyTag.storyId, storyId), inArray(storyTag.tagId, toRemove)))
    await tx
      .update(tag)
      .set({ usageCount: sql`GREATEST(${tag.usageCount} - 1, 0)` })
      .where(inArray(tag.id, toRemove))
  }
  if (toAdd.length > 0) {
    await tx.insert(storyTag).values(toAdd.map((tagId) => ({ storyId, tagId })))
    await tx
      .update(tag)
      .set({ usageCount: sql`${tag.usageCount} + 1` })
      .where(inArray(tag.id, toAdd))
  }
}
