<script lang="ts">
  import { onMount } from 'svelte'
  import { BASE_API_URL } from '$app/env/public'
  import { createInfiniteQuery } from '@tanstack/svelte-query'
  import { CircleAlertIcon, CircleIcon, NewspaperIcon } from '@lucide/svelte'

  import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
  import * as Alert from '$lib/components/ui/alert'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { Helmet } from '$lib/components/helmet'
  import { FeedItem } from '$lib/components/feed'

  const LIMIT = DEFAULT_LIMIT

  const query = createInfiniteQuery(() => ({
    queryKey: ['user', 'feed'],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      const res = await fetch(`${BASE_API_URL}/v1/feed?page=${pageParam}&limit=${LIMIT}`, {
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      return await res.json()
    },
    initialPageParam: DEFAULT_PAGE,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.hasMore) {
        return lastPage.next
      }
      return undefined
    },
  }))

  let elementRef: HTMLElement | undefined = $state()

  onMount(() => {
    if (typeof IntersectionObserver === 'undefined' || !elementRef) return

    const target = elementRef // narrowed to HTMLElement here, captured by the closures below

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage()
        }
      },
      { threshold: [0, 1.0] },
    )

    observer.observe(target)

    return () => observer.unobserve(target)
  })
</script>

<Helmet title="My Feed | fancanon" />

<div class="relative min-h-screen">
  <header class="py-10">
    <div class="mx-auto w-full max-w-screen-lg px-3">
      <h1 class="font-heading text-3xl md:text-5xl">My Feed</h1>
    </div>
  </header>

  <div class="mx-auto w-full max-w-screen-lg space-y-3 px-3 py-5">
    {#if query.status === 'pending'}
      {#each Array(DEFAULT_LIMIT) as _, idx (idx)}
        <Skeleton class="h-42 w-full rounded-xl" />
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
      {#each query.data.pages as { feed }, idx (idx)}
        {#if feed?.length === 0}
          <div class="py-12 text-center">
            <NewspaperIcon class="mx-auto mb-4 size-12 text-muted-foreground" />
            <h3 class="mb-2 text-lg font-semibold">Feed Empty</h3>
            <p class="text-muted-foreground">Go ahead follow some authors.</p>
          </div>
        {/if}

        {#each feed as { story, chapter, verb }, idx (idx)}
          <FeedItem {story} {chapter} {verb} />
        {/each}
      {/each}
    {/if}

    <div class="space-y-5 py-3">
      {#if query.fetchStatus === 'fetching'}
        <div class="flex w-full items-center justify-center">
          <CircleIcon class="size-6 animate-ping" />
        </div>
      {/if}
    </div>

    <div bind:this={elementRef}></div>
  </div>
</div>
