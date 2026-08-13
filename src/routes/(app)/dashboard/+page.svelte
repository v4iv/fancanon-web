<script lang="ts">
  import type { PageProps } from './$types'
  import { createQuery } from '@tanstack/svelte-query'
  import { PlusIcon } from '@lucide/svelte'

  import { Button } from '$lib/components/ui/button'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { Helmet } from '$lib/components/helmet'
  import { columns, StoryTable } from '$lib/components/dashboard/stories'
  import { LikeStat, RetentionStat, ViewStat } from '$lib/components/dashboard/stat-cards'

  let { data }: PageProps = $props()

  const statsQuery = createQuery(() => ({
    queryKey: ['stats'],
    queryFn: async (): Promise<any> => {
      const res = await fetch('/api/dashboard/stats')

      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      return res.json()
    },
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  }))
</script>

<Helmet title="Dashboard | fancanon" />

<div class="relative min-h-screen w-full">
  <header class="space-y-10 py-10">
    <div class="mx-auto w-full max-w-screen-lg px-3">
      <h1 class="font-heading text-3xl md:text-5xl">Dashboard</h1>
    </div>

    <div
      class="mx-auto grid w-full max-w-screen-lg grid-cols-1 items-center gap-4 px-3 md:grid-cols-2 lg:grid-cols-3"
    >
      {#if statsQuery.status === 'pending'}
        <Skeleton class="h-46 w-full rounded-xl" />
        <Skeleton class="h-46 w-full rounded-xl" />
        <Skeleton class="h-46 w-full rounded-xl" />
      {/if}

      {#if statsQuery.status === 'success'}
        <div class="col-span-1">
          <ViewStat
            count={statsQuery.data.stats.totalViews}
            storyCount={statsQuery.data.stats.totalStories}
          />
        </div>

        <div class="col-span-1">
          <LikeStat
            count={statsQuery.data.stats.totalLikes}
            viewCount={statsQuery.data.stats.totalViews}
          />
        </div>

        <div class="col-span-1">
          <RetentionStat
            count={statsQuery.data.stats.totalReadLaters}
            commentCount={statsQuery.data.stats.totalComments}
          />
        </div>
      {/if}
    </div>
  </header>

  <div class="mx-auto w-full max-w-screen-lg space-y-3 px-3 py-5">
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <p class="font-heading text-2xl">My Stories</p>

        <Button href="/stories/new">
          <PlusIcon />
          New Story
        </Button>
      </div>

      <StoryTable data={data.stories} {columns} />
    </div>
  </div>
</div>
