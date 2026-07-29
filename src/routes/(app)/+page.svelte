<script lang="ts">
  import { m } from '$lib/paraglide/messages.js'
  import { Ripple } from '$lib/components/ripple'
</script>

<div class="min-h-screen">
  <!-- Hero -->
  <div class="relative w-full py-20">
    <div class="mx-auto w-full max-w-screen-lg space-y-5 px-2 py-3 text-center">
      <h1 class="font-heading text-3xl">
        {m['hero.title']()}
        <span class="font-sans font-thin tracking-wider">{m['app-name']()}</span>
      </h1>

      <p>{m['hero.subtitle']()}</p>
    </div>

    <Ripple />
  </div>
</div>
