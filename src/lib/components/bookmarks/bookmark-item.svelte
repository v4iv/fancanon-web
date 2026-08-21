<script lang="ts">
  import { formatDistanceToNow } from 'date-fns'
  import { BookmarkIcon, CalendarIcon, UserIcon } from '@lucide/svelte'

  import { m } from '$lib/paraglide/messages'
  import * as Item from '$lib/components/ui/item'
  import { Separator } from '$lib/components/ui/separator'
  import { Button } from '$lib/components/ui/button'
  import { ShareWidget } from '$lib/components/sharing'

  interface Props {
    bookmark: {
      id: string
      title: string
      author: {
        username: string | null
      }
      // description: string | null
      // createdAt: Date
      // updatedAt: Date
      latestBookmarkAt: Date
      chapters: { id: string; title: string; chapterIndex: number }[]
    }
  }

  let { bookmark }: Props = $props()

  // svelte-ignore state_referenced_locally
  const savedOn = formatDistanceToNow(new Date(bookmark.latestBookmarkAt))
</script>

<div class="mb-5 space-y-2">
  <!-- Title -->
  <h3 class="mb-2 font-heading text-xl font-semibold">
    <a href={`/stories/${bookmark.id}`} class="underline-offset-4 hover:underline"
      >{bookmark.title}</a
    >
  </h3>

  <!-- User  -->
  <div class="mb-2 flex h-4 items-center gap-2 text-sm text-muted-foreground">
    <UserIcon class="size-4" />

    <Button
      variant="link"
      href={`/user/${bookmark.author?.username}`}
      class="w-fit p-0 font-mono tracking-wide underline-offset-4 hover:text-muted-foreground hover:underline"
    >
      @{bookmark?.author?.username}
    </Button>
  </div>

  <Separator />

  <!-- Bookmarked Chapters -->
  <div class="space-y-3 py-5">
    {#each bookmark.chapters as chapter, idx (idx)}
      <div class="relative w-full">
        <Item.Root variant="muted">
          {#snippet child({ props })}
            <a href={`/stories/${bookmark.id}/chapters/${chapter.chapterIndex}`} {...props}>
              <Item.Content>
                <Item.Title class="text-lg">
                  <div>
                    <span class="font-bold"
                      >{m['story.chapter-index']({ index: chapter.chapterIndex })}</span
                    >
                    <span>
                      {chapter.title.length ? `: ${chapter.title}` : ''}
                    </span>
                  </div>
                </Item.Title>

                <Item.Description class="flex items-center gap-2 text-xs">
                  <CalendarIcon class="size-3" />

                  <span>
                    saved {savedOn} ago
                  </span>
                </Item.Description>
              </Item.Content>

              <Item.Actions>
                <ShareWidget path={`/stories/${bookmark.id}/chapters/${chapter.chapterIndex}`} />
              </Item.Actions>
            </a>
          {/snippet}
        </Item.Root>
        <BookmarkIcon class="absolute -top-1 right-0 size-4 fill-primary stroke-primary" />
      </div>
    {/each}
  </div>
</div>
