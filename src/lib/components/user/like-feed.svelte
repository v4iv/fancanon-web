<script lang="ts">
  import { page } from '$app/state'
  import { createInfiniteQuery } from '@tanstack/svelte-query'
  import { CircleAlertIcon, CircleIcon, HeartIcon } from '@lucide/svelte'

  import { DEFAULT_LIMIT } from '$lib/constants'
  import * as Alert from '$lib/components/ui/alert'
  import { Button } from '$lib/components/ui/button'
  import * as StoryCard from '$lib/components/story-card'

  interface Props {
    session?: any
  }

  const { session }: Props = $props()

  const LIMIT = DEFAULT_LIMIT

  const fetchLikes = async ({ pageParam }: { pageParam: number | undefined }) => {
    const res = await fetch(`/api/user/likes?page=${pageParam}&limit=${LIMIT}`)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return await res.json()
  }

  const query = createInfiniteQuery(() => ({
    queryKey: ['user', page.params.username, 'likes'],
    queryFn: fetchLikes,
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

<div class="w-full space-y-3 py-3">
  {#if query.status === 'pending'}
    {#each Array(DEFAULT_LIMIT) as _, idx (idx)}
      <StoryCard.Skeleton />
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
    {#each query.data.pages as { likes: stories }, idx (idx)}
      {#if stories?.length === 0}
        <div class="py-12 text-center">
          <HeartIcon class="mx-auto mb-4 size-12 text-muted-foreground" />
          <h3 class="mb-2 text-lg font-semibold">No liked stories</h3>
          <p class="text-muted-foreground">This user hasn't liked any stories yet.</p>
        </div>
      {/if}

      {#each stories as story (story.id)}
        <StoryCard.Root {story} {session} />
      {/each}
    {/each}

    <div class="py-3">
      {#if query.fetchStatus === 'fetching'}
        <div class="flex w-full items-center justify-center">
          <CircleIcon class="size-6 animate-ping" />
        </div>
      {/if}
    </div>

    {#if query.hasNextPage}
      <Button
        variant="secondary"
        size="lg"
        class="w-full"
        onclick={query.fetchNextPage}
        disabled={query.isFetchingNextPage}
      >
        Load More
      </Button>
    {/if}
  {/if}
</div>
