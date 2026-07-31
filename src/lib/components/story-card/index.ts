export type StoryTag = { tag: { name: string; slug: string; type: string } }

export function groupTagsByType(tags: StoryTag[]) {
  return {
    relationships: tags.filter((t) => t.tag.type === 'RELATIONSHIP'),
    characters: tags.filter((t) => t.tag.type === 'CHARACTER'),
    freeform: tags.filter((t) => t.tag.type === 'FREEFORM' || t.tag.type === 'FANDOM_FREEFORM'),
    warnings: tags.filter((t) => t.tag.type === 'WARNING'),
  }
}

export { default as Tags } from './tags.svelte'
export { default as StoryCard, default as Root } from './story-card.svelte'
export { default as StoryCardSkeleton, default as Skeleton } from './story-card-skeleton.svelte'
