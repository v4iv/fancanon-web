<script lang="ts">
  import { untrack } from 'svelte'
  import { BASE_API_URL } from '$app/env/public'
  import {
    createInfiniteQuery,
    createQuery,
    createMutation,
    useQueryClient,
  } from '@tanstack/svelte-query'
  import { BellIcon, CircleAlertIcon, CircleIcon } from '@lucide/svelte'

  import { m } from '$lib/paraglide/messages.js'
  import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
  import * as Alert from '$lib/components/ui/alert'
  import * as Popover from '$lib/components/ui/popover'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { NotificationItem } from '$lib/components/notifications'

  const limit = DEFAULT_LIMIT

  let open = $state(false)

  const client = useQueryClient()

  const fetchNotifications = async ({
    pageParam,
  }: {
    pageParam: number | undefined
  }): Promise<any> => {
    const res = await fetch(`${BASE_API_URL}/v1/notifications?page=${pageParam}&limit=${limit}`, {
      credentials: 'include',
    })
    return await res.json()
  }

  const fetchIndicator = async (): Promise<any> => {
    const res = await fetch(`${BASE_API_URL}/v1/notifications/indicator`, {
      credentials: 'include',
    })

    return await res.json()
  }

  const query = createInfiniteQuery(() => ({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    initialPageParam: DEFAULT_PAGE,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.next) {
        return lastPage.next
      }
      return undefined
    },
    enabled: open, // only fetch when the popover is actually opened
  }))

  const notificationIndicatorQuery = createQuery(() => ({
    queryKey: ['notifications', 'indicator'],
    queryFn: fetchIndicator,
    refetchInterval: 60 * 10000, // 10 minute — light enough to not matter, frequent enough to feel responsive
    refetchOnWindowFocus: true, // catches "came back from another tab" — cheap, low-risk
    staleTime: 30 * 1000,
  }))

  const markSeenMutation = createMutation(() => ({
    mutationFn: (ids: string[]) =>
      fetch(`${BASE_API_URL}/v1/notifications`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids }),
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['notifications'] })
      client.invalidateQueries({ queryKey: ['notifications', 'indicator'] })
    },
  }))

  $effect(() => {
    if (query.data?.pages) {
      const unseenIds = query.data.pages
        .flatMap((page) => page.notifications)
        .filter((n) => !n.seenAt)
        .map((n) => n.id)

      if (unseenIds.length > 0) {
        untrack(() => {
          markSeenMutation.mutate(unseenIds)
        })
      }
    }
  })
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    class={buttonVariants({ variant: 'ghost', size: 'icon-lg', class: 'rounded-full' })}
  >
    <BellIcon class="size-5">
      {#if notificationIndicatorQuery.data?.unseenCount > 0}
        <circle r="3" cx="21" cy="5" stroke="none" fill="#F56565" />
      {/if}
    </BellIcon>

    <span class="sr-only">{m['navbar.notifications']()}</span>
  </Popover.Trigger>

  <Popover.Content align="end" class="h-96 w-90">
    <div class="space-y-3">
      <div class="space-y-2 border-b py-2">
        <h4 class="font-heading text-lg font-semibold">{m['navbar.notifications']()}</h4>

        {#if query.status === 'success'}
          {#each query.data.pages as { notifications }, idx (idx)}
            {#if notifications.length === 0}
              <p class="text-xs text-muted-foreground">You have no new notifications</p>
            {:else}
              <p class="text-xs text-muted-foreground">
                You have {query.data.pages[0].totalCount} notifications.
              </p>
            {/if}
          {/each}
        {/if}
      </div>

      <div class="max-h-72 space-y-3 overflow-y-auto pb-2">
        {#if query.status === 'pending'}
          {#each Array(limit) as _, idx (idx)}
            <div><Skeleton class="h-18 w-full" /></div>
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
          {#each query.data.pages as { notifications }, idx (idx)}
            {#each notifications as n, idx (idx)}
              {@const { activity } = n}
              <NotificationItem bind:open {activity} />
            {/each}
          {/each}

          {#if query.hasNextPage}
            <Button
              disabled={query.isPending || query.isFetchingNextPage}
              onclick={query.fetchNextPage}
            >
              <div class="space-y-5 py-3">
                {#if query.fetchStatus === 'fetching'}
                  <div class="flex w-full items-center justify-center">
                    <CircleIcon class="size-4 animate-ping" />
                  </div>
                {/if}
              </div>
              Load More
            </Button>
          {/if}
        {/if}
      </div>
    </div>
  </Popover.Content>
</Popover.Root>
