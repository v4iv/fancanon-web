<script lang="ts">
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { numify } from 'numify'
  import { BASE_API_URL } from '$app/env/public'
  import { createQuery } from '@tanstack/svelte-query'
  import { SvelteURLSearchParams } from 'svelte/reactivity'
  import { CircleAlertIcon, FunnelIcon, SearchIcon } from '@lucide/svelte'

  import type { StoryType } from '$lib/types'
  import { m } from '$lib/paraglide/messages.js'
  import { useSession } from '$lib/client'
  import { Helmet } from '$lib/components/helmet'
  import * as Alert from '$lib/components/ui/alert'
  import * as Pagination from '$lib/components/ui/pagination'
  import * as Select from '$lib/components/ui/select'
  import { Label } from '$lib/components/ui/label'
  import * as StoryCard from '$lib/components/story-card'
  import * as Popover from '$lib/components/ui/popover'
  import * as RadioGroup from '$lib/components/ui/radio-group'
  import { buttonVariants } from '$lib/components/ui/button'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import { Separator } from '$lib/components/ui/separator'
  import { ContentRating, DEFAULT_LIMIT, DEFAULT_PAGE, Languages } from '$lib/constants'

  const searchParams = $derived(page.url.searchParams)
  const session = useSession()

  let limit = $derived(parseInt(searchParams.get('limit') ?? `${DEFAULT_LIMIT}`))
  let sort = $derived(searchParams.get('sort') ?? 'relevance') as string
  // let currentPage = $derived(parseInt(searchParams.get('page') ?? `${DEFAULT_PAGE}`))
  let selectedLanguages = $derived<string[]>(
    searchParams.getAll('languages').length
      ? searchParams.getAll('languages')
      : Object.values(Languages),
  )
  let selectedRatings = $derived<string[]>(
    searchParams.getAll('ratings').length
      ? searchParams.getAll('ratings')
      : Object.values(ContentRating),
  )

  let completion = $derived<string>(searchParams.get('completion') || 'any') // any | completed | ongoing

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'New' },
    { value: 'oldest', label: 'Old' },
  ]

  const completionOptions = [
    { value: 'any', label: m['feed.any']() },
    { value: 'completed', label: m['feed.completed']() },
    { value: 'ongoing', label: m['feed.ongoing']() },
  ]

  const sortTriggerContent = $derived(sortOptions.find((o) => o.value === sort)?.label)

  type APIResponse = {
    stories: StoryType[]
    totalCount: number
    currentPage: number
    nextPage: number | null
    totalPages: number
    hasMore: boolean
  }

  const fetchSearch = async (): Promise<APIResponse> => {
    const response = await fetch(`${BASE_API_URL}/v1/search?${searchParams}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Network response was not okay')
    }

    return response.json()
  }

  const searchQuery = createQuery(() => ({
    queryKey: [searchParams.toString()],
    queryFn: () => fetchSearch(),
    enabled: Boolean(searchParams.get('q')),
  }))

  // TODO: consider adding debounce of 100-200ms
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
      newSearchParams.set('page', `${DEFAULT_PAGE}`)
    }

    goto(`?${newSearchParams.toString()}`, { replaceState: true })
  }

  function toggleContentRating(rating: string) {
    const newRatings = selectedRatings.includes(rating)
      ? selectedRatings.filter((r: string) => r !== rating)
      : [...selectedRatings, rating]

    updateURL({ ratings: newRatings })
  }

  function updateCompletion(newCompletion: string) {
    updateURL({ completion: newCompletion })
  }

  function toggleLanguage(language: string) {
    const newLanguages = selectedLanguages.includes(language)
      ? selectedLanguages.filter((l: string) => l !== language)
      : [...selectedLanguages, language]

    updateURL({ languages: newLanguages })
  }
</script>

<Helmet title="Search | fancanon" />

<div class="relative min-h-screen w-full">
  <div class="sticky top-0 z-30 border-b bg-background p-3">
    <div class="mx-auto w-full max-w-screen-lg">
      <div class="flex items-center justify-between px-2">
        {#if searchQuery.status === 'pending' && searchQuery.isEnabled}
          <p class="animate-pulse font-mono text-sm text-muted-foreground">Searching...</p>
        {:else if searchQuery.status === 'success'}
          <p class="font-mono text-sm text-muted-foreground">
            {numify(searchQuery.data.totalCount)} results found
          </p>
        {:else}
          <p class="animate-pulse font-mono text-sm text-muted-foreground">
            Go Ahead Search Something!
          </p>
        {/if}

        <div class="flex items-center gap-2">
          <Label for="sort" class="hidden text-sm text-muted-foreground md:block">Sort By:</Label>
          <Select.Root
            type="single"
            disabled={!searchQuery.isEnabled}
            onValueChange={(value) => {
              updateURL({ sort: value })
            }}
          >
            <Select.Trigger id="sort" class="w-30">
              {sortTriggerContent}
              <span class="sr-only">Sort By</span>
            </Select.Trigger>

            <Select.Content>
              {#each sortOptions as sortOption, idx (idx)}
                <Select.Item value={sortOption.value}>
                  {sortOption.label}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>

          <!-- Filters -->
          <Popover.Root>
            <Popover.Trigger
              disabled={!searchQuery.isEnabled}
              class={buttonVariants({ variant: 'outline', size: 'icon' })}
            >
              <FunnelIcon class="size-4" />
              <span class="sr-only">{m['feed.filters']()}</span>
            </Popover.Trigger>

            <Popover.Content class="space-y-3 p-3">
              <!-- Content Ratings -->
              <div class="space-y-3">
                <p class="text-sm">{m['feed.content-ratings']()}</p>

                {#each Object.entries(ContentRating) as [value, label] (value)}
                  {@const checked = Boolean(selectedRatings.includes(value))}
                  <div class="flex items-center gap-3">
                    <Checkbox {checked} onclick={() => toggleContentRating(value)} />
                    <p class="text-sm">{label}</p>
                  </div>
                {/each}
              </div>

              <Separator />

              <!-- Completion -->
              <div class="space-y-3">
                <p class="text-sm">{m['feed.completion-status']()}</p>

                <RadioGroup.Root value={completion}>
                  {#each completionOptions as completionOption, idx (idx)}
                    <div class="flex items-center space-x-2">
                      <RadioGroup.Item
                        id={completionOption.value}
                        value={completionOption.value}
                        onclick={() => updateCompletion(completionOption.value)}
                      />
                      <Label for={completionOption.value}>{completionOption.label}</Label>
                    </div>
                  {/each}
                </RadioGroup.Root>
              </div>

              <Separator />

              <!-- Languages -->
              <div class="space-y-3">
                <p class="text-sm">{m['feed.languages']()}</p>

                {#each Object.entries(Languages) as [value, label] (value)}
                  {@const checked = Boolean(selectedLanguages.includes(label))}
                  <div class="flex items-center gap-3">
                    <Checkbox {checked} onclick={() => toggleLanguage(label)} />
                    <p class="text-sm capitalize">{label}</p>
                  </div>
                {/each}
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>
    </div>
  </div>

  <!-- results area -->
  <div class="mx-auto w-full max-w-screen-lg px-3 py-5">
    <div class="space-y-3">
      <!-- story skeletons -->
      {#if searchQuery.status === 'pending' && searchQuery.isEnabled}
        {#each Array(DEFAULT_LIMIT) as _, idx (idx)}
          <StoryCard.Skeleton />
        {/each}
      {/if}

      <!-- error alert -->
      {#if searchQuery.status === 'error'}
        <Alert.Root variant="destructive" class="border-destructive">
          <CircleAlertIcon />

          <Alert.Title>Error</Alert.Title>

          <Alert.Description>
            <p>An unexpected error occurred! Please try again.</p>
          </Alert.Description>
        </Alert.Root>
      {/if}

      <!-- success -->
      {#if searchQuery.status === 'success'}
        {#if searchQuery.data.stories.length === 0}
          <div class="min-h-screen py-12 text-center">
            <SearchIcon class="mx-auto mb-4 size-12 text-muted-foreground" />
            <p class="mb-2 font-heading text-2xl">No Results Found</p>
            <p class="text-muted-foreground">
              Looks like there are no stories with your search query. Please check your spelling and
              try again.
            </p>
          </div>
        {/if}

        <div class="min-h-screen space-y-3 py-5">
          {#each searchQuery.data.stories as story, idx (idx)}
            <StoryCard.Root {story} {session} />
          {/each}
        </div>

        <Pagination.Root class="my-10" perPage={limit} count={searchQuery.data.totalCount}>
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
