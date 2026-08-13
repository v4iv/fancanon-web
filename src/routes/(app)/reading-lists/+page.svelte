<script lang="ts">
  import { numify } from 'numify'
  import { createInfiniteQuery } from '@tanstack/svelte-query'
  import { CircleAlertIcon, CircleIcon, ClockIcon } from '@lucide/svelte'

  import { DEFAULT_LIMIT } from '$lib/constants'
  import { useSession } from '$lib/client'
  import { Helmet } from '$lib/components/helmet'
  import * as Alert from '$lib/components/ui/alert'
  import * as StoryCard from '$lib/components/story-card'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { Skeleton } from '$lib/components/ui/skeleton'

  const session = useSession()

  const fetchReadingList = async ({ pageParam }: { pageParam: number | undefined }) => {
    const res = await fetch(`/api/user/read-later?page=${pageParam}&limit=${DEFAULT_LIMIT}`)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return await res.json()
  }

  const query = createInfiniteQuery(() => ({
    queryKey: ['user', 'reading-lists'],
    queryFn: fetchReadingList,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.next) {
        return lastPage.next
      }
      return undefined
    },
  }))
</script>

<Helmet title="Reading Lists | fancanon" />

<div class="relative min-h-screen w-full">
  <header class="py-10">
    <div class="mx-auto w-full max-w-screen-lg space-y-4 px-3">
      <h1 class="font-heading text-3xl md:text-5xl">Reading Lists</h1>
      <p class="text-lg">Read Later</p>
    </div>
  </header>

  <div class="border-y py-3">
    {#if query.status === 'pending'}
      <div class="mx-auto w-full max-w-screen-lg px-3">
        <div class="flex h-6 items-center space-x-4">
          <Skeleton class="h-4 w-14" />
          <Skeleton class="size-4" />

          <Separator orientation="vertical" />
        </div>
      </div>
    {/if}

    {#if query.status === 'error'}
      <div class="mx-auto w-full max-w-screen-lg px-3">
        <div class="flex h-6 items-center space-x-4">
          <p class="font-mono text-sm">Stories: 0</p>

          <Separator orientation="vertical" />
        </div>
      </div>
    {/if}

    {#if query.status === 'success'}
      <div class="mx-auto w-full max-w-screen-lg px-3">
        <div class="flex h-6 items-center space-x-4">
          <p class="font-mono text-sm">
            Stories: {numify(query.data.pages[0].count)}
          </p>

          <Separator orientation="vertical" />
        </div>
      </div>
    {/if}
  </div>

  <div class="mx-auto w-full max-w-screen-lg px-3 py-5">
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
        {#each query.data.pages as { readLaters: stories }, idx (idx)}
          {#if stories?.length === 0}
            <div class="py-12 text-center">
              <ClockIcon class="mx-auto mb-4 size-12 text-muted-foreground" />

              <p class="mb-2 font-heading text-2xl">Reading list is empty</p>

              <p class="text-muted-foreground">You haven't added any stories to read later.</p>
            </div>
          {/if}

          {#each stories as story, idx (idx)}
            <StoryCard.Root {story} {session} />
          {/each}
        {/each}

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

      <div class="py-3">
        {#if query.fetchStatus === 'fetching'}
          <div class="flex w-full items-center justify-center">
            <CircleIcon class="size-6 animate-ping" />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
