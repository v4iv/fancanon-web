<script lang="ts">
  import { goto } from '$app/navigation'

  import { m } from '$lib/paraglide/messages.js'
  import { groupTagsByType, type StoryTag } from './index'
  import { Button } from '$lib/components/ui/button'

  interface Props {
    tags: StoryTag[]
  }

  const { tags }: Props = $props()

  interface TagLimits {
    relationships: number
    characters: number
    freeform: number
  }

  const DEFAULT_LIMITS: TagLimits = { relationships: 2, characters: 3, freeform: 4 }

  function buildVisibleTags(grouped: ReturnType<typeof groupTagsByType>, limits: TagLimits) {
    const visible = [
      ...grouped.relationships.slice(0, limits.relationships),
      ...grouped.characters.slice(0, limits.characters),
      ...grouped.freeform.slice(0, limits.freeform),
    ]

    const totalCount =
      grouped.relationships.length + grouped.characters.length + grouped.freeform.length
    const hiddenCount = totalCount - visible.length

    return { visible, hiddenCount }
  }

  const groupedTags = $derived(groupTagsByType(tags))
  const { visible: visibleTags, hiddenCount } = $derived(
    buildVisibleTags(groupedTags, DEFAULT_LIMITS),
  )

  const TYPE_SUFFIX: Record<string, string> = {
    RELATIONSHIP: 'R',
    CHARACTER: 'C',
    FANDOM_FREEFORM: 'F',
    // FREEFORM intentionally omitted — no suffix for the default type
  }
</script>

<div class="flex flex-wrap gap-1">
  {#each visibleTags as { tag }, idx (idx)}
    <Button
      variant="link"
      onclick={(event) => {
        event.stopPropagation()
        event.preventDefault()
        goto(`/tags/${tag.slug}`)
      }}
      class="gap-1/2 rounded-full px-0 hover:text-muted-foreground md:first:pl-0 [&_svg]:size-3"
    >
      &num;&nbsp;{tag.name}
      {#if TYPE_SUFFIX[tag.type]}({TYPE_SUFFIX[tag.type]}){/if}
    </Button>
  {/each}
  {#if hiddenCount > 0}
    <Button
      variant="link"
      disabled
      class="gap-1/2 rounded-full px-2 hover:text-muted-foreground md:first:pl-0 [&_svg]:size-3"
    >
      {m['story.hidden-tags']({ count: hiddenCount })}
    </Button>
  {/if}
</div>
