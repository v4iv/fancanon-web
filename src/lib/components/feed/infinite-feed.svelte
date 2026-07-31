<script lang="ts">
  import { onMount } from 'svelte'
  import { createInfiniteQuery } from '@tanstack/svelte-query'
  import { BookOpen, CircleAlertIcon, CircleIcon } from '@lucide/svelte'

  import { m } from '$lib/paraglide/messages.js'
  import { useSession } from '$lib/client'
  import * as Alert from '$lib/components/ui/alert'
  import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
  import { StoryCard, StoryCardSkeleton } from '$lib/components/story-card'

  interface Props {
    api: string
    queryKeys: string[] | string
    limit: number
    enabled?: boolean
  }

  let { api, queryKeys, limit, enabled = true }: Props = $props()

  const session = useSession()

  const fetchStories = async ({ pageParam }: { pageParam: number | undefined }): Promise<any> => {
    const res = await fetch(`${api}?page=${pageParam}&limit=${limit}`)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return await res.json()
  }

  const query = createInfiniteQuery(() => ({
    queryKey: [...queryKeys],
    queryFn: fetchStories,
    initialPageParam: DEFAULT_PAGE,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // avoid reshuffling an in-progress infinite scroll
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

<div class="w-full space-y-3 py-5">
  {#if query.status === 'pending'}
    {#each Array(DEFAULT_LIMIT) as _, idx (idx)}
      <StoryCardSkeleton />
    {/each}
  {/if}
  {#if query.status === 'error'}
    <Alert.Root variant="destructive" class="border-destructive">
      <CircleAlertIcon />
      <Alert.Title>{m['feed.error-title']()}</Alert.Title>
      <Alert.Description>
        <p>{m['feed.error-description']()}</p>
      </Alert.Description>
    </Alert.Root>
  {/if}

  {#if query.status === 'success'}
    {#each query.data.pages as { stories }, idx (idx)}
      {#if stories?.length === 0}
        <div class="py-12 text-center">
          <BookOpen class="mx-auto mb-4 size-12 text-muted-foreground" />

          <p class="mb-2 font-heading text-2xl">{m['feed.empty-title']()}</p>

          <p class="text-muted-foreground">
            {m['feed.empty-description']()}
          </p>
        </div>
      {/if}
      {#each stories as story (story.id)}
        <StoryCard {story} {session} />
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
