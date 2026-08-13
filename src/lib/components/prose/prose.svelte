<script lang="ts">
  import type { Snippet } from 'svelte'

  import { cn } from '$lib/utils'

  interface Props {
    proseSize?: 'prose-xs' | 'prose-sm' | 'prose-md' | 'prose-lg' | 'prose-xl'
    class?: string
    children: Snippet<[]>
  }

  let { proseSize = 'prose-xl', class: className = '', children }: Props = $props()
</script>

<div
  class={cn(
    'prose  prose-zinc dark:prose-invert prose-headings:font-heading prose-img:w-full',
    proseSize,
    className,
  )}
>
  {@render children()}
</div>
