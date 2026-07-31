<script lang="ts">
  import { m } from '$lib/paraglide/messages.js'
  import * as Tabs from '$lib/components/ui/underline-tabs'
  import { Helmet } from '$lib/components/helmet'
  import { Ripple } from '$lib/components/ripple'
  import InfiniteFeed from '$lib/components/feed/infinite-feed.svelte'
  import { DEFAULT_LIMIT } from '$lib/constants'

  const feeds = [
    { name: 'new', slug: 'new' },
    { name: 'hot', slug: 'hot' },
    { name: 'anime & manga', slug: 'anime-manga' },
    { name: 'books', slug: 'books' },
    { name: 'cartoons', slug: 'cartoons' },
    { name: 'comics', slug: 'comics' },
    { name: 'video games', slug: 'video-games' },
    { name: 'movies & TV', slug: 'movies-tv' },
    { name: 'music', slug: 'music' },
    { name: 'plays', slug: 'plays' },
    { name: 'podcasts', slug: 'podcasts' },
    { name: 'others', slug: 'others' },
  ]

  let currentTab = $state('new')

  const getValue = () => {
    return currentTab
  }

  const setValue = (newValue: string) => {
    currentTab = newValue
  }
</script>

<Helmet title={m['home-page.title']()} />

<div class="min-h-screen">
  <!-- Hero -->
  <div class="relative w-full py-20">
    <div class="mx-auto w-full max-w-screen-lg space-y-5 px-2 py-3 text-center">
      <h1 class="font-heading text-3xl">
        {m['home-page.hero-title']()}
        <span class="font-sans font-thin tracking-wider">{m['app-name']()}</span>
      </h1>

      <p>{m['home-page.hero-subtitle']()}</p>
    </div>

    <Ripple />
  </div>

  <div class="w-full py-5">
    <Tabs.Root bind:value={getValue, setValue} class="relative w-full">
      <Tabs.List class="sticky top-0 w-full bg-background">
        <div class="mx-auto flex w-full max-w-screen-lg items-center px-3">
          {#each feeds as feed, idx (idx)}
            {@const key = `categories.${feed.slug}`}
            <Tabs.Trigger class="w-full capitalize" value={feed.slug}>{m[key]()}</Tabs.Trigger>
          {/each}
        </div>
      </Tabs.List>

      <div class="mx-auto w-full max-w-screen-lg items-center px-3">
        {#each feeds as feed, idx (idx)}
          <Tabs.Content value={feed.slug}>
            <InfiniteFeed
              api={`/api/feed/${feed.slug}`}
              queryKeys={[feed.slug, 'stories']}
              limit={DEFAULT_LIMIT}
              enabled={currentTab === feed.slug || feed.slug === 'hot' || feed.slug === 'new'}
            />
          </Tabs.Content>
        {/each}
      </div>
    </Tabs.Root>
  </div>
</div>
