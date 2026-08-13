<script lang="ts">
  import { goto } from '$app/navigation'
  import { formatDistanceToNow } from 'date-fns'
  import { CalendarIcon, UserRoundIcon } from '@lucide/svelte'

  import { m } from '$lib/paraglide/messages'
  import * as Card from '$lib/components/ui/card'

  interface Props {
    verb: 'STORY_PUBLISHED' | 'CHAPTER_PUBLISHED'
    story: {
      id: string
      title: string
      author: {
        username: string
      }
      createdAt: string
    }
    chapter: {
      id: string
      title: string
      chapterIndex: string
      createdAt: string
    }
  }

  // eslint-disable-next-line svelte/no-unused-props
  const { story, chapter, verb }: Props = $props()

  // svelte-ignore state_referenced_locally
  const timestamp = formatDistanceToNow(new Date(chapter.createdAt)) + ' ago'
</script>

<Card.Root
  class="w-full cursor-pointer transition-shadow duration-200 hover:bg-muted/50 hover:shadow-md dark:hover:bg-input/30"
  onclick={() => {
    if (verb === 'STORY_PUBLISHED') {
      goto(`/stories/${story.id}`)
    } else {
      goto(`/stories/${story.id}/chapters/${chapter.chapterIndex}`)
    }
  }}
>
  <Card.Header>
    <div class="flex flex-wrap gap-1 text-sm text-muted-foreground">
      <a
        class="flex w-fit items-center gap-1 p-0 font-mono tracking-wide text-primary underline-offset-4 hover:text-muted-foreground hover:underline"
        href={`/user/${story.author?.username}`}
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          goto(`/user/${story.author?.username}`)
        }}
      >
        <UserRoundIcon class="size-4" />

        <span>@{story.author?.username}</span>
      </a>
      {#if verb === 'STORY_PUBLISHED'}
        <span class="text-wrap">published a new story</span>
      {:else}
        <span class="text-wrap">added a new chapter</span>
      {/if}
    </div>

    <Card.Title class="text-xl">
      {story.title}
    </Card.Title>
  </Card.Header>

  <Card.Footer>
    <div class="space-y-3">
      <p class="flex items-center gap-2 font-heading text-xl font-semibold">
        <span class="font-bold">{m['story.chapter-index']({ index: chapter.chapterIndex })}</span>

        <span>
          {chapter.title.length ? `: ${chapter.title}` : ''}
        </span>
      </p>

      <div class="flex items-center gap-2 text-xs">
        <CalendarIcon class="size-3 text-muted-foreground" />

        <p class="text-muted-foreground">
          {timestamp}
        </p>
      </div>
    </div>
  </Card.Footer>
</Card.Root>
