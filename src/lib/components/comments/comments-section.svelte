<script lang="ts">
  import { onMount } from 'svelte'
  import { BASE_API_URL } from '$app/env/public'
  import { createInfiniteQuery } from '@tanstack/svelte-query'
  import { CircleAlertIcon, CircleIcon } from '@lucide/svelte'

  import type { CommentType } from '$lib/types'
  import { useSession } from '$lib/client'
  import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
  import * as Alert from '$lib/components/ui/alert'
  import { CommentForm } from '$lib/components/forms/comment-form'
  import { CommentItem, CommentSkeleton, CommentsEmpty, ThreadView } from './index'

  interface Props {
    chapterId: string
  }

  let { chapterId }: Props = $props()

  const session = useSession()

  const fetchComments = async ({ pageParam }: { pageParam: number | undefined }): Promise<any> => {
    const res = await fetch(
      `${BASE_API_URL}/v1/chapters/${chapterId}/comments?page=${pageParam}&limit=${DEFAULT_LIMIT}`,
      { credentials: 'include' },
    )

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return await res.json()
  }

  const query = createInfiniteQuery(() => ({
    queryKey: ['comments', chapterId],
    queryFn: fetchComments,
    initialPageParam: DEFAULT_PAGE,
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage) {
        return lastPage.nextPage
      }
      return undefined
    },
  }))

  let observerTarget: HTMLDivElement

  function setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage()
      }
    })

    if (observerTarget) {
      observer.observe(observerTarget)
    }

    return () => observer.disconnect()
  }

  onMount(() => {
    const cleanup = setupObserver()

    return cleanup
  })

  let threadView: { commentId: string | null; parentComment: CommentType | null } = $state({
    commentId: null,
    parentComment: null,
  })
</script>

<div id="comments">
  <div class="sticky top-0 z-30 space-y-3 bg-background py-3">
    <div class="mx-auto w-full max-w-screen-md space-y-3 p-2">
      <CommentForm {chapterId} user={$session?.data?.user} />
    </div>
  </div>

  <div class="mx-auto w-full max-w-screen-md p-3">
    {#if query.status === 'pending'}
      <CommentSkeleton />
      <CommentSkeleton depth={1} />
      <CommentSkeleton />
      <CommentSkeleton depth={1} />
      <CommentSkeleton depth={2} />
      <CommentSkeleton depth={3} />
      <CommentSkeleton />
    {/if}

    {#if query.status === 'error'}
      <Alert.Root variant="destructive" class="border-destructive">
        <CircleAlertIcon />

        <Alert.Title>Error</Alert.Title>

        <Alert.Description>
          <p>An unexpected error occurred! Please try again.</p>
        </Alert.Description>
      </Alert.Root>
    {/if}

    {#if query.status === 'success'}
      {#each query.data.pages as { comments }, idx (idx)}
        {#if comments?.length === 0}
          <CommentsEmpty />
        {/if}

        {#if threadView.commentId && threadView.parentComment}
          <ThreadView
            comment={threadView.parentComment}
            user={$session?.data?.user}
            onBack={() =>
              (threadView = {
                commentId: null,
                parentComment: null,
              })}
            onViewThread={(c: CommentType) =>
              (threadView = {
                commentId: c.id,
                parentComment: c,
              })}
          />
        {:else}
          {#each comments as comment, idx (idx)}
            <CommentItem
              {comment}
              isInThreadView={false}
              user={$session?.data?.user}
              onViewThread={(c: CommentType) =>
                (threadView = {
                  commentId: c.id,
                  parentComment: c,
                })}
            />
          {/each}
        {/if}
      {/each}
    {/if}

    <div class="py-3">
      {#if query.fetchStatus === 'fetching'}
        <div class="flex w-full items-center justify-center">
          <CircleIcon class="size-6 animate-ping" />
        </div>
      {/if}
    </div>

    <div bind:this={observerTarget}></div>
  </div>
</div>
