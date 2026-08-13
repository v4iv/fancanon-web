<script lang="ts">
  import { page } from '$app/state'
  import { createQuery } from '@tanstack/svelte-query'
  import { BookOpenIcon, CircleAlertIcon, CircleIcon } from '@lucide/svelte'

  import * as Alert from '$lib/components/ui/alert'
  import * as StoryCard from '$lib/components/story-card'

  interface Props {
    session?: any
  }

  let { session }: Props = $props()

  const fetchStories = async () => {
    const res = await fetch(`/api/user/${page.params.username}/stories`)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return await res.json()
  }

  const query = createQuery(() => ({
    queryKey: ['user', page.params.username, 'stories'],
    queryFn: fetchStories,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // avoid reshuffling an in-progress infinite scroll
  }))
</script>

<div class="w-full space-y-3 py-3">
  {#if query.status === 'pending'}
    {#each Array(10) as _, idx (idx)}
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
    {#if query.data.stories.length === 0}
      <div class="py-12 text-center">
        <BookOpenIcon class="mx-auto mb-4 size-12 text-muted-foreground" />
        <h3 class="mb-2 font-heading text-2xl">No Stories Published Yet</h3>
        <p class="text-muted-foreground">This user hasn't published any stories yet.</p>
      </div>
    {/if}

    {#each query.data.stories as story (story.id)}
      <StoryCard.Root {story} {session} />
    {/each}
  {/if}

  <div class="py-3">
    {#if query.fetchStatus === 'fetching'}
      <div class="flex w-full items-center justify-center">
        <CircleIcon class="size-6 animate-ping" />
      </div>
    {/if}
  </div>
</div>
