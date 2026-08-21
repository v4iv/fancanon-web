<script lang="ts">
  import { SvelteURL } from 'svelte/reactivity'
  import { MusicIcon } from '@lucide/svelte'

  import type { ChapterEmbedType } from '$lib/types'
  import * as Accordion from '$lib/components/ui/accordion'

  interface Props {
    embed: ChapterEmbedType
  }

  let { embed }: Props = $props()

  let spotifyHtml = $state<string | null>(null)
  let isLoading = $state(false)

  /**
   * Transforms standard Apple Music URLs into embed iframe URLs.
   * e.g., https://music.apple.com/... -> https://embed.music.apple.com/...
   */
  function getAppleMusicEmbedUrl(url: string): string | null {
    try {
      const parsed = new SvelteURL(url)
      if (!parsed.hostname.includes('music.apple.com')) return null

      parsed.hostname = 'embed.music.apple.com'
      return parsed.toString()
    } catch {
      return null
    }
  }

  // Derive Apple Music embed URL directly when embed.url updates
  let appleMusicUrl = $derived(
    embed.provider === 'apple-music' ? getAppleMusicEmbedUrl(embed.url) : null,
  )

  $effect(() => {
    if (embed.provider !== 'spotify' || !embed.url) {
      spotifyHtml = null
      return
    }

    let isMounted = true
    isLoading = true

    fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(embed.url)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: any) => {
        if (isMounted) {
          spotifyHtml = data?.html ?? null
        }
      })
      .catch((err) => {
        console.error('Failed to load Spotify embed:', err)
        if (isMounted) spotifyHtml = null
      })
      .finally(() => {
        if (isMounted) isLoading = false
      })

    return () => {
      isMounted = false
    }
  })
</script>

<Accordion.Root type="single">
  <Accordion.Item value="music">
    <Accordion.Trigger class="flex cursor-pointer items-center gap-2 text-rose-500">
      <MusicIcon class="size-4" /> <span>Music</span>
    </Accordion.Trigger>

    <Accordion.Content class="text-left text-lg">
      {#if embed.provider === 'spotify'}
        {#if isLoading}
          <div class="py-4 text-sm text-neutral-500">Loading Player...</div>
        {:else if spotifyHtml}
          <div>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html spotifyHtml}
          </div>
        {:else}
          <p class="text-sm text-neutral-500">Invalid Spotify URL.</p>
        {/if}
      {:else if embed.provider === 'apple-music'}
        {#if appleMusicUrl}
          <iframe
            title="Apple Music Player"
            src={appleMusicUrl}
            height="450"
            width="100%"
            frameborder="0"
            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
            loading="lazy"
            class="w-full rounded-xl border-0"
          ></iframe>
        {:else}
          <p class="text-sm text-neutral-500">Invalid Apple Music URL.</p>
        {/if}
      {/if}
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
