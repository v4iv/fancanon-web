<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { ArrowUpDownIcon } from '@lucide/svelte'

  import { Button } from '$lib/components/ui/button'

  let { title, variant = 'ghost', ...restProps }: ComponentProps<typeof Button> = $props()
</script>

<Button {variant} {...restProps}>
  {title}
  <ArrowUpDownIcon class="ms-2 size-4" />
</Button>
