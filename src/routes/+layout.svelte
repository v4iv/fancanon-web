<script lang="ts">
  import './layout.css'
  import type { LayoutProps } from './$types'

  import { ModeWatcher } from 'mode-watcher'

  const { children }: LayoutProps = $props()
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <title>fancanon</title>
  <meta name="description" content="The Ultimate Fanfiction Platform" />
</svelte:head>

<ModeWatcher />

{@render children()}
