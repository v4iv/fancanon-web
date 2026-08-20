<script lang="ts">
  import { BASE_API_URL } from '$app/env/public'
  import { createInfiniteQuery, createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { CircleAlertIcon, CircleIcon, RotateCcwClockIcon, Trash2Icon } from '@lucide/svelte'
  import { captureException } from '@sentry/sveltekit'

  import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
  import { track } from '$lib/analytics'
  import * as Alert from '$lib/components/ui/alert'
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
  import { Button } from '$lib/components/ui/button'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { Helmet } from '$lib/components/helmet'
  import { HistoryItem } from '$lib/components/history'

  const LIMIT = DEFAULT_LIMIT

  const client = useQueryClient()

  let open = $state(false)

  const query = createInfiniteQuery(() => ({
    queryKey: ['user', 'history'],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      const res = await fetch(`${BASE_API_URL}/v1/history?page=${pageParam}&limit=${LIMIT}`, {
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

  const clearHistoryMutation = createMutation(() => ({
    mutationFn: async () => {
      const res = await fetch(`${BASE_API_URL}/v1/history`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      return res.json()
    },
    onMutate: async () => {
      await client.cancelQueries()

      return
    },
    onError: (error) => {
      captureException(error)
    },
    onSettled: () => {
      track('clear_history')
      client.invalidateQueries({ queryKey: ['user', 'history'] })
    },
  }))
</script>

<Helmet title="History | fancanon" />

<div class="relative min-h-screen">
  <header class="py-10">
    <div class="mx-auto w-full max-w-screen-lg px-3">
      <h1 class="font-heading text-3xl md:text-5xl">History</h1>
    </div>
  </header>

  <div class="border-y py-3">
    <div class="mx-auto w-full max-w-screen-lg px-3">
      <div class="flex items-center justify-end">
        <Button variant="destructive" size="sm" onclick={() => (open = !open)}>
          <Trash2Icon />
          <span>Clear History</span>
        </Button>
      </div>
    </div>
  </div>

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
      {#each query.data.pages as { history }, idx (idx)}
        {#if history?.length === 0}
          <div class="py-12 text-center">
            <RotateCcwClockIcon class="mx-auto mb-4 size-12 text-muted-foreground" />
            <h3 class="mb-2 text-lg font-semibold">History Empty</h3>
            <p class="text-muted-foreground">Go ahead read something.</p>
          </div>
        {/if}

        {#each history as { story, chapter, lastViewedAt }, idx (idx)}
          <HistoryItem {story} {chapter} {lastViewedAt} />
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

  <AlertDialog.Root bind:open>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone. This will permanently clear all of your current history.</AlertDialog.Description
        >
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>

        <AlertDialog.Action
          onclick={() => {
            clearHistoryMutation.mutate()
            open = false
          }}
        >
          Continue
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</div>
