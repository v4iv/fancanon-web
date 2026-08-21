<script lang="ts">
  import { m } from '$lib/paraglide/messages'
  import logo from '$lib/assets/logo.svg'
  import uwu from '$lib/assets/kawaii/uwu-shadow.svg'
  import { uwuState } from '$lib/hooks/uwu.svelte'
</script>

<header class="flex w-full items-center justify-center border-b p-4">
  {#if uwuState.enabled}
    <!-- uwu -->
    <!-- data-sveltekit-reload tells SvelteKit to skip its internal router and let the browser perform a native HTTP request for /. -->
    <a href="/" data-sveltekit-reload>
      <img src={uwu} alt="fancanon logo that links to home" class="h-8 w-auto" />
      <span class="sr-only">{m['app-name']()}</span>
    </a>
  {:else}
    <!-- logo & app name -->
    <!-- data-sveltekit-reload tells SvelteKit to skip its internal router and let the browser perform a native HTTP request for /. -->
    <a href="/" class="flex items-center gap-2" data-sveltekit-reload>
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
