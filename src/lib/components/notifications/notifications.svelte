<script lang="ts">
  import { BellIcon } from '@lucide/svelte'

  import { buttonVariants } from '$lib/components/ui/button'
  import * as Popover from '$lib/components/ui/popover'
</script>

<Popover.Root>
  <Popover.Trigger
    class={buttonVariants({ variant: 'ghost', size: 'icon-lg', class: 'rounded-full' })}
  >
    <BellIcon class="size-5">
      <circle r="3" cx="21" cy="5" stroke="none" fill="#F56565" />
    </BellIcon>

    <span class="sr-only">notifications</span>
  </Popover.Trigger>

  <Popover.Content align="end" class="h-96 w-sm">
    <div class="space-y-4">
      <div class="space-y-2">
        <h4 class="text-sm font-semibold">Notifications</h4>
        <p class="text-xs text-muted-foreground">You have no new notifications</p>
      </div>
      <div class="max-h-80 space-y-3 overflow-y-auto"></div>
    </div>
  </Popover.Content>
</Popover.Root>
