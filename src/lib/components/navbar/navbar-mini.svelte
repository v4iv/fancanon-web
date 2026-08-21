<script lang="ts">
  import { ORIGIN } from '$app/env/public'

  import { m } from '$lib/paraglide/messages'
  import logo from '$lib/assets/logo.svg'
  import uwu from '$lib/assets/kawaii/uwu-shadow.svg'
  import { uwuState } from '$lib/hooks/uwu.svelte'
</script>

<header class="flex w-full items-center justify-center border-b p-4">
  {#if uwuState.enabled}
    <!-- uwu -->
    <a href="/">
      <img src={uwu} alt="fancanon logo that links to home" class="h-8 w-auto" />
      <span class="sr-only">{m['app-name']()}</span>
    </a>
  {:else}
    <!-- logo & app name -->
    <a href={ORIGIN} class="flex items-center gap-2">
      <img
        src={logo}
        alt="fancanon logo that links to home"
        class="size-6"
        width={24}
        height={24}
      />
      <span class="text-2xl font-thin tracking-wider">{m['app-name']()}</span>
    </a>
  {/if}
</header>
