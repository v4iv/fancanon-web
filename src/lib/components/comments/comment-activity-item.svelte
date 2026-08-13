<script lang="ts">
  import { goto } from '$app/navigation'
  import { formatDistanceToNow } from 'date-fns'
  import { DotIcon, HeartIcon, MessageCircleIcon } from '@lucide/svelte'

  import type { CommentType, StoryType } from '$lib/types'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'

  interface Props {
    comment: CommentType & {
      chapter: { chapterIndex: string; story: StoryType }
      parent: CommentType
    }
    username?: string
  }

  const { comment, username = '' }: Props = $props()
</script>

<div
  role="button"
  tabindex="0"
  onkeydown={(e) => {
    if (e.key === 'Enter') {
      goto(`/stories/${comment.chapter.story.id}/chapters/${comment.chapter.chapterIndex}#comments`)
    }
  }}
  onclick={() => {
    goto(`/stories/${comment.chapter.story.id}/chapters/${comment.chapter.chapterIndex}#comments`)
  }}
  class="cursor-pointer border-b border-dashed bg-card p-5 text-card-foreground transition-shadow duration-200 last:border-none hover:bg-muted/50 dark:hover:bg-input/30"
>
  <!-- Breadcrumbs -->
  <p class="flex flex-wrap text-sm">
    <a
      class="px-0 text-sm text-primary hover:text-muted-foreground"
      href={`/stories/${comment.chapter.story.id}`}
      onclick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        goto(`/stories/${comment.chapter.story.id}`)
      }}
    >
      {comment.chapter.story.title}
    </a>

    <DotIcon />

    <a
      href={`/stories/${comment.chapter.story.id}/chapters/${comment.chapter.chapterIndex}`}
      class="px-0 text-sm text-primary hover:text-muted-foreground"
      onclick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        goto(`/stories/${comment.chapter.story.id}/chapters/${comment.chapter.chapterIndex}`)
      }}
    >
      Chapter {comment.chapter.chapterIndex}
    </a>
  </p>

  <!-- Commented on/Replied to & Time -->
  {#if !comment.parent}
    <p class="mb-2 text-sm text-muted-foreground">
      <Button
        variant="link"
        class="px-0 hover:text-muted-foreground"
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          goto(`/user/${username}`)
        }}
      >
        @{username}
      </Button> commented {formatDistanceToNow(comment.createdAt)} ago
    </p>
  {:else}
    <p class="mb-2 text-sm text-muted-foreground">
      <Button
        variant="link"
        class="px-0 hover:text-muted-foreground"
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          goto(`/user/${username}`)
        }}
      >
        @{username}
      </Button> replied to
      <Button
        variant="link"
        class="px-0"
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          goto(`/user/${comment.parent.author.username}`)
        }}
      >
        @{comment.parent.author.username}
      </Button>
      {formatDistanceToNow(comment.createdAt)} ago
    </p>
  {/if}

  <!-- Content -->
  <p class="mb-3">{comment.content}</p>

  <!-- Likes and Replies -->
  <div class="flex h-4 items-center gap-2 text-sm">
    <HeartIcon class="size-4" />
    <p>{comment.likeCount} {comment.likeCount > 1 ? 'Likes' : 'Like'}</p>
    <Separator orientation="vertical" class="h-4" />
    <MessageCircleIcon class="size-4" />
    <p>{comment.replyCount} {comment.replyCount > 1 ? 'Replies' : 'Reply'}</p>
  </div>
</div>
