<script lang="ts">
  import './layout.css'
  import type { LayoutProps } from './$types'
  import type { Pathname } from '$app/types'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import { ModeWatcher } from 'mode-watcher'
  import { locales, localizeHref } from '$lib/paraglide/runtime'

  import favicon from '$lib/assets/favicon.svg'
  import { Toaster } from '$lib/components/ui/sonner'
  import { TooltipProvider } from '$lib/components/ui/tooltip'

  const { children }: LayoutProps = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>fancanon</title>

  <meta name="description" content="The Ultimate Fanfiction Platform" />
</svelte:head>

<ModeWatcher themeColors={{ dark: '#042F2E', light: '#134E4A' }} />

<TooltipProvider>
  {@render children()}
</TooltipProvider>

<Toaster richColors />

<div style="display:none">
  {#each locales as locale (locale)}
    <a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
  {/each}
</div>
