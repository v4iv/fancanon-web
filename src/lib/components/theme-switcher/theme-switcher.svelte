<script lang="ts">
  import SunIcon from '@lucide/svelte/icons/sun'
  import MoonIcon from '@lucide/svelte/icons/moon'

  import { m } from '$lib/paraglide/messages.js'
  import { resetMode, setMode } from 'mode-watcher'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
  import { buttonVariants } from '$lib/components/ui/button/index.js'
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={buttonVariants({ variant: 'ghost', size: 'icon-lg', class: 'rounded-full' })}
  >
    <SunIcon class="size-5 scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90" />
    <MoonIcon
      class="absolute size-5 scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
    />
    <span class="sr-only">{m['navbar.theme-switcher']()}</span>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content align="end">
    <DropdownMenu.Item onclick={() => setMode('light')}>{m['navbar.light']()}</DropdownMenu.Item>

    <DropdownMenu.Item onclick={() => setMode('dark')}>{m['navbar.dark']()}</DropdownMenu.Item>

    <DropdownMenu.Item onclick={() => resetMode()}>{m['navbar.system']()}</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
