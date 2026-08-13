<script lang="ts">
  import type { PageProps } from './$types'
  import { numify } from 'numify'
  import { createInfiniteQuery } from '@tanstack/svelte-query'
  import { BookmarkIcon, CircleAlertIcon, CircleIcon } from '@lucide/svelte'

  import { DEFAULT_LIMIT } from '$lib/constants'
  import { Helmet } from '$lib/components/helmet'
  import * as Alert from '$lib/components/ui/alert'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { BookmarkItem, BookmarkItemSkeleton } from '$lib/components/bookmarks'

  let { data }: PageProps = $props()

  const LIMIT = DEFAULT_LIMIT

  const fetchBookmarks = async ({ pageParam }: { pageParam: number | undefined }) => {
    const res = await fetch(`/api/user/bookmarks?page=${pageParam}&limit=${LIMIT}`)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return await res.json()
  }

  const query = createInfiniteQuery(() => ({
    queryKey: ['user', data.user.username, 'bookmarks'],
    queryFn: fetchBookmarks,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.next) {
        return lastPage.next
      }
      return undefined
    },
  }))
</script>

<Helmet title="Bookmarks | fancanon" />

<div class="relative min-h-screen w-full">
  <header class="py-10">
    <div class="mx-auto w-full max-w-screen-lg px-3">
      <h1 class="font-heading text-3xl md:text-5xl">Bookmarks</h1>
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
          <p class="font-mono text-sm">Bookmarks: 0</p>

          <Separator orientation="vertical" />
        </div>
      </div>
    {/if}

    {#if query.status === 'success'}
      <div class="mx-auto w-full max-w-screen-lg px-3">
        <div class="flex h-6 items-center space-x-4">
          <p class="font-mono text-sm">
            Bookmarks: {numify(query.data.pages[0].count)}
          </p>

          <Separator orientation="vertical" />
        </div>
      </div>
    {/if}
  </div>

  <div class="mx-auto w-full max-w-screen-lg px-3 py-5">
    <div class="w-full py-3">
      {#if query.status === 'pending'}
        <BookmarkItemSkeleton />
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
        {#each query.data.pages as { bookmarks }, idx (idx)}
          {#if bookmarks?.length === 0}
            <div class="py-12 text-center">
              <BookmarkIcon class="mx-auto mb-4 size-12 text-muted-foreground" />

              <p class="mb-2 font-heading text-2xl">No Bookmarks Found</p>

              <p class="text-muted-foreground">You haven't bookmarked anything yet.</p>
            </div>
          {/if}

          {#each bookmarks as bookmark (bookmark.id)}
            <BookmarkItem {bookmark} />
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
  </div>
</div>
