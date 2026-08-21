<script lang="ts">
  import { LINKS } from '$lib/constants'
  import { Button } from '$lib/components/ui/button'
  import { Bluesky, Discord, Reddit, X } from '$lib/components/brand-icons'
  import { toggleUwu, uwuState } from '$lib/hooks/uwu.svelte'
</script>

<footer class="border-t py-10 md:py-16">
  <div class="mx-auto max-w-5xl px-6">
    <a href="/" aria-label="go home" class="mx-auto block size-fit">
      <img src="/logo.svg" alt="fancanon logo" />
    </a>
    <div class="my-8 flex flex-wrap justify-center gap-6 text-sm">
      {#each LINKS as link, idx (idx)}
        <a href={link.href} class="block text-muted-foreground duration-150 hover:text-primary">
          <span>{link.label}</span>
        </a>
      {/each}
    </div>
    <div class="my-8 flex flex-wrap items-center justify-center gap-6 text-sm">
      <a
        href="https://x.com/fancanonapp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bluesky"
        class="block text-muted-foreground hover:text-primary"
      >
        <X className="size-5 fill-muted-foreground hover:fill-primary" />
      </a>
      <a
        href="https://discord.gg/7EwXTUyp9u"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discord"
        class="block text-muted-foreground hover:text-primary"
      >
        <Discord className="size-6 fill-muted-foreground hover:fill-primary" />
      </a>
      <a
        href="https://reddit.com/r/fancanon"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Reddit"
        class="block text-muted-foreground hover:text-primary"
      >
        <Reddit className="size-6 fill-muted-foreground hover:fill-primary" />
      </a>
      <a
        href="https://bsky.app/profile/fancanon.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bluesky"
        class="block text-muted-foreground hover:text-primary"
      >
        <Bluesky className="size-6 fill-muted-foreground hover:fill-primary" />
      </a>
    </div>

    <p class="block text-center font-mono text-sm text-muted-foreground">
      Copyright &copy; {new Date().getFullYear()} fancanon &bull; All rights reserved
    </p>

    <div class="mx-auto flex justify-center">
      <Button type="button" variant="link" size="xs" onclick={toggleUwu}>
        {#if uwuState.enabled}
          no uwu plz
        {:else}
          uwu?
        {/if}
      </Button>
    </div>
  </div>
</footer>
