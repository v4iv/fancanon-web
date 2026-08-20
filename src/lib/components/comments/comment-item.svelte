<script lang="ts">
  import { formatDistanceToNow } from 'date-fns'
  import { CirclePlusIcon, MessageCircleIcon } from '@lucide/svelte'

  import { MAX_THREAD_LIMIT } from '$lib/constants'
  import type { CommentType, UserType } from '$lib/types'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { CommentItem, CommentLikeButton, CommentOptions } from './index'
  import { CommentForm } from '$lib/components/forms/comment-form'

  interface Props {
    comment: CommentType
    user?: UserType
    onViewThread: (c: CommentType) => any
    isInThreadView?: boolean
  }

  let { comment, user, isInThreadView = false, onViewThread }: Props = $props()

  // svelte-ignore state_referenced_locally
  const timestamp = formatDistanceToNow(new Date(comment.createdAt)) + ' ago'

  let liked = $derived(comment.likes.length > 0)
  let likesCount = $derived(comment.likeCount)

  let startReply = $state(false)

  // Determine if this comment's direct replies should be collapsed into a single "View all replies" button
  // This happens if the current comment is at `MAX_THREAD_LIMIT - 1` and we are not already in a focused thread view.
  let shouldCollapseReplies = $derived(
    Boolean(comment.depth === MAX_THREAD_LIMIT && !isInThreadView && comment.replies.length > 0),
  )
</script>

<div
  id={`comment-${comment.id}`}
  class={comment.depth > 0 ? 'ml-3 border-l border-muted pl-4' : ''}
>
  <div class="flex gap-3 py-3">
    <Avatar.Root class="size-6 border">
      <Avatar.Image src={comment.author?.image ?? ''} alt={comment.author?.name} />
      <Avatar.Fallback>{comment.author?.name?.[0]}</Avatar.Fallback>
    </Avatar.Root>

    <div class="flex-1 space-y-1">
      <div class="flex items-center gap-2 text-sm">
        <a
          class="font-mono underline-offset-4 hover:underline"
          href={`/user/${comment.author?.username}`}
        >
          @{comment.author?.username}
        </a>
        <span class="text-xs text-muted-foreground">{timestamp}</span>
      </div>

      <div class="prose-md prose text-foreground">
        <p class="whitespace-pre-wrap">{comment.content}</p>
      </div>

      <div class="flex items-center gap-2">
        <CommentLikeButton
          {user}
          bind:liked
          bind:likesCount
          commentId={comment.id}
          chapterId={comment.chapterId}
        />

        <Button
          class="text-primary"
          variant="ghost"
          size="sm"
          onclick={() => (startReply = !startReply)}
        >
          <MessageCircleIcon class="size-4" />
          Reply
        </Button>

        <CommentOptions
          text={comment.content}
          commentId={comment.id}
          chapterId={comment.chapterId}
          isAuthor={Boolean(user?.id === comment.author.id)}
        />
      </div>

      {#if startReply}
        <CommentForm
          {user}
          bind:startReply
          parentId={comment.id}
          chapterId={comment.chapterId}
          submitText="Reply"
          placeholder="Write a reply..."
        />
      {/if}
    </div>
  </div>

  {#if comment.replyCount > 0}
    <!-- If replies should be collapsed, show a single "View all replies" button -->
    {#if shouldCollapseReplies}
      <div class="ml-3 border-l border-muted pl-4">
        <Button variant="link" size="sm" class="text-sm" onclick={() => onViewThread(comment)}>
          <CirclePlusIcon />
          View more replies in this thread
        </Button>
      </div>
    {:else}
      <!-- Otherwise, render replies normally (recursively) -->
      {#each comment.replies as reply, idx (idx)}
        <CommentItem comment={reply} {user} {onViewThread} {isInThreadView} />
      {/each}
    {/if}
  {/if}
</div>
