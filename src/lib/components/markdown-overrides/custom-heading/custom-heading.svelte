<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    depth: number
    children?: Snippet
  }

  const { depth, children }: Props = $props()
</script>

<svelte:element this={`h${depth + 1}`} id={`heading-${depth}`}>
  {@render children?.()}
</svelte:element>
