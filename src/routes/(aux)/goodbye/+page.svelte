<script lang="ts">
  import { m } from '$lib/paraglide/messages.js'
  import logo from '$lib/assets/logo.svg'
  import uwu from '$lib/assets/kawaii/uwu-shadow.svg'
  import * as Card from '$lib/components/ui/card'
  import { Helmet } from '$lib/components/helmet'
  import { uwuState } from '$lib/hooks/uwu.svelte'
</script>

<Helmet title="Goodbye | fancanon" />

<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
  <div class="flex w-full max-w-sm flex-col gap-6">
    <a href="/" class="flex items-center gap-2 self-center">
      <div class="flex items-center justify-center gap-2 rounded-md">
        {#if uwuState.enabled}
          <img src={uwu} alt="logo" class="h-16 w-auto" />
        {:else}
          <img src={logo} alt="logo" height={24} width={24} />
          <span class="text-2xl font-thin tracking-wider text-accent-foreground">
            {m['app-name']()}
          </span>
        {/if}
      </div>
    </a>

    <div class="flex flex-col gap-6">
      <Card.Root>
        <Card.Header class="flex flex-col items-center justify-center text-center">
          <Card.Title class="text-2xl">Goodbye</Card.Title>

          <Card.Description>Hope to see you again.</Card.Description>
        </Card.Header>
      </Card.Root>
    </div>
  </div>
</div>
