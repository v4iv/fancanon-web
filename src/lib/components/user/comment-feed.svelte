<script lang="ts">
  import { page } from '$app/state'
  import { createInfiniteQuery } from '@tanstack/svelte-query'
  import { CircleAlertIcon, CircleIcon, MessageCircleIcon } from '@lucide/svelte'

  import { DEFAULT_LIMIT } from '$lib/constants'
  import * as Alert from '$lib/components/ui/alert'
  import { Button } from '$lib/components/ui/button'
  import { CommentActivityItem, CommentActivitySkeleton } from '$lib/components/comments'

  const LIMIT = DEFAULT_LIMIT

  const fetchComments = async ({ pageParam }: { pageParam: number | undefined }) => {
    const res = await fetch(`/api/user/comments?page=${pageParam}&limit=${LIMIT}`)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return await res.json()
  }

  const query = createInfiniteQuery(() => ({
    queryKey: ['user', page.params.username, 'comments'],
    queryFn: fetchComments,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.next) {
        return lastPage.next
      }
      return undefined
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // avoid reshuffling an in-progress infinite scroll
  }))
</script>

<div class="w-full py-3">
  {#if query.status === 'pending'}
    {#each Array(LIMIT) as _, idx (idx)}
      <CommentActivitySkeleton />
    {/each}
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
        <div class="py-12 text-center">
          <MessageCircleIcon class="mx-auto mb-4 size-12 text-muted-foreground" />
          <h3 class="mb-2 text-lg font-semibold">No Comments Found</h3>
          <p class="text-muted-foreground">This user has not commented on anything yet.</p>
        </div>
      {/if}

      {#each comments as comment, idx (idx)}
        <CommentActivityItem username={page.params.username} {comment} />
      {/each}
    {/each}

    {#if query.fetchStatus === 'fetching'}
      <div class="py-10">
        <div class="flex w-full items-center justify-center">
          <CircleIcon class="size-6 animate-ping" />
        </div>
      </div>
    {/if}

    {#if query.hasNextPage}
      <div class="py-3">
        <Button
          variant="secondary"
          size="lg"
          class="w-full"
          onclick={query.fetchNextPage}
          disabled={query.isFetchingNextPage}
        >
          Load More
        </Button>
      </div>
    {/if}
  {/if}
</div>
