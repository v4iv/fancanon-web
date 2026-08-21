<script lang="ts">
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { MediaQuery, SvelteURLSearchParams } from 'svelte/reactivity'
  import { createQuery } from '@tanstack/svelte-query'
  import { BookOpen, CircleAlertIcon } from '@lucide/svelte'

  import type { StoryType } from '$lib/types'
  import { useSession } from '$lib/client'
  import { m } from '$lib/paraglide/messages.js'
  import { ContentRating, DEFAULT_LIMIT, DEFAULT_PAGE, Languages } from '$lib/constants'
  import * as Alert from '$lib/components/ui/alert'
  import * as Pagination from '$lib/components/ui/pagination'
  import { Toolbar } from '$lib/components/feed'
  import * as StoryCard from '$lib/components/story-card'

  interface Props {
    api: string
    queryKeys: string[]
  }

  let { api, queryKeys }: Props = $props()

  const searchParams = $derived(page.url.searchParams)

  const session = useSession()

  interface APIResponse {
    stories: StoryType[]
    totalCount: number
    currentPage: number
    nextPage: number | null
    totalPages: number
    hasMore: boolean
  }

  // Reactive state for filters and pagination
  let currentPage = $derived(parseInt(searchParams.get('page') || `${DEFAULT_PAGE}`))
  let limit = $derived(parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`))
  let sort = $derived(searchParams.get('sort') || 'new')
  let selectedLanguages = $derived(
    searchParams.getAll('languages').length
      ? searchParams.getAll('languages')
      : Object.keys(Languages),
  )
  let selectedContentRatings = $derived<string[]>(
    searchParams.getAll('ratings').length
      ? searchParams.getAll('ratings')
      : Object.values(ContentRating),
  )
  let completion = $derived(searchParams.get('completion') || 'any')

  // Build query parameters
  const queryParams = $derived.by(() => {
    const params = new SvelteURLSearchParams()
    params.set('page', currentPage.toString())
    params.set('limit', limit.toString())
    params.set('sort', sort)

    selectedLanguages.forEach((lang) => params.append('languages', lang))
    selectedContentRatings.forEach((rating) => params.append('ratings', rating))

    if (completion !== 'any') {
      params.set('completion', completion)
    }

    return params.toString()
  })

  const query = createQuery(() => ({
    queryKey: ['feed', ...queryKeys, queryParams],
    queryFn: async (): Promise<APIResponse> => {
      const response = await fetch(`${api}?${queryParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch stories')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // avoid reshuffling an in-progress infinite scroll
  }))

  // Helper functions for URL updates
  function updateURL(updates: Record<string, string | string[] | null>) {
    const newSearchParams = new SvelteURLSearchParams(page.url.searchParams)

    for (const [key, value] of Object.entries(updates)) {
      // Remove existing values for this key
      newSearchParams.delete(key)

      if (value === null || value === 'any' || (Array.isArray(value) && value.length === 0)) {
        // Don't add parameter if value is null, 'any', or empty array
        continue
      } else if (Array.isArray(value)) {
        // Add multiple values for the same key
        value.forEach((v) => newSearchParams.append(key, v))
      } else {
        newSearchParams.set(key, value)
      }
    }

    // Always reset to page 1 when filters change (unless we're specifically updating the page)
    if (
      !Object.prototype.hasOwnProperty.call(updates, 'page') &&
      Object.keys(updates).some((key) => key !== 'page')
    ) {
      newSearchParams.set('page', '1')
    }

    goto(`?${newSearchParams.toString()}`, { replaceState: true })
  }

  const isDesktop = new MediaQuery('(min-width: 768px)')

  const siblingCount = $derived(isDesktop.current ? 3 : 0)
</script>

<div class="space-y-5">
  <!-- Toolbar -->
  <Toolbar
    bind:sort
    bind:selectedLanguages
    bind:selectedContentRatings
    bind:completion
    {updateURL}
  />

  <!-- Stories -->
  <div class="mx-auto w-full max-w-screen-lg p-3">
    <div class="space-y-3">
      {#if query.status === 'pending'}
        {#each Array(DEFAULT_LIMIT) as _, idx (idx)}
          <StoryCard.Skeleton />
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
        {#if query.data.stories.length === 0}
          <div class="min-h-screen py-12 text-center">
            <BookOpen class="mx-auto mb-4 size-12 text-muted-foreground" />

            <p class="mb-2 font-heading text-2xl">{m['feed.empty-title']()}</p>

            <p class="text-muted-foreground">
              {m['feed.empty-description']()}
            </p>
          </div>
        {/if}

        <div class="min-h-screen space-y-3">
          {#each query.data.stories as story, idx (idx)}
            <StoryCard.Root {story} {session} />
          {/each}
        </div>

        <Pagination.Root class="my-10" {siblingCount} perPage={limit} count={query.data.totalCount}>
          {#snippet children({ pages, currentPage })}
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.PrevButton
                  onclick={() => {
                    updateURL({ page: (currentPage - 1).toString() })
                  }}
                />
              </Pagination.Item>
              {#each pages as page (page.key)}
                {#if page.type === 'ellipsis'}
                  <Pagination.Item>
                    <Pagination.Ellipsis />
                  </Pagination.Item>
                {:else}
                  <Pagination.Item
                    onclick={() => {
                      updateURL({ page: page.value.toString() })
                    }}
                  >
                    <Pagination.Link {page} isActive={currentPage === page.value}>
                      {page.value}
                    </Pagination.Link>
                  </Pagination.Item>
                {/if}
              {/each}
              <Pagination.Item>
                <Pagination.NextButton
                  onclick={() => {
                    updateURL({ page: (currentPage + 1).toString() })
                  }}
                />
              </Pagination.Item>
            </Pagination.Content>
          {/snippet}
        </Pagination.Root>
      {/if}
    </div>
  </div>
</div>
