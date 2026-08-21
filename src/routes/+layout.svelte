<script lang="ts">
  import './layout.css'
  import type { LayoutProps } from './$types'
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  // import { resolve } from '$app/paths'
  import { browser, dev } from '$app/env'
  // import type { Pathname } from '$app/types'
  import { ModeWatcher } from 'mode-watcher'
  import { ProgressBar } from '@prgm/sveltekit-progress-bar'
  import { QueryClientProvider } from '@tanstack/svelte-query'

  import favicon from '$lib/assets/favicon.svg'
  import { initUwu } from '$lib/hooks/uwu.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import { TooltipProvider } from '$lib/components/ui/tooltip'
  // import { locales, localizeHref } from '$lib/paraglide/runtime'

  // const SvelteQueryDevtools = (await import('@tanstack/svelte-query-devtools')).SvelteQueryDevtools

  let { data, children }: LayoutProps = $props()

  onMount(() => {
    initUwu(page.url.searchParams.get('uwu'))
  })
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>fancanon</title>

  <meta
    name="description"
    content="The Ultimate Fan Fiction Platform. For Humans, By Humans. Read, write, and share fan fiction across every fandom in a modern, community-driven experience."
  />
</svelte:head>

<ProgressBar class="text-primary" zIndex={100} />

<ModeWatcher themeColors={{ dark: '#042F2E', light: '#134E4A' }} />

<QueryClientProvider client={data.queryClient}>
  <TooltipProvider>
    {@render children()}
  </TooltipProvider>

  {#if dev && browser}
    <!-- <SvelteQueryDevtools /> -->
  {/if}
</QueryClientProvider>

<Toaster richColors />

<!-- <div style="display:none"> -->
<!--   {#each locales as locale (locale)} -->
<!--     <a -->
<!--       href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)} -->
<!--       data-sveltekit-reload -->
<!--     > -->
<!--       {locale} -->
<!--     </a> -->
<!--   {/each} -->
<!-- </div> -->
