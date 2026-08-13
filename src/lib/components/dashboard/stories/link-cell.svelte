<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { SquareArrowOutUpRightIcon } from '@lucide/svelte'

  import { Button } from '$lib/components/ui/button'

  let { title, href, variant = 'link', ...restProps }: ComponentProps<typeof Button> = $props()
</script>

<Button {variant} {href} {...restProps}>
  {title}
  <SquareArrowOutUpRightIcon class="size-4" />
</Button>
