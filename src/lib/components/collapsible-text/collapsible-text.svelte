<script lang="ts">
  import { cn } from '$lib/utils'
  import { Button } from '$lib/components/ui/button'

  interface Props {
    text?: string | null
    maxLines?: number
    classes?: string
  }

  let { text = '', maxLines = 2, classes = '' }: Props = $props()

  let isExpanded = $state(false)
  let isOverflowing = $state(false)
  let paragraphRef: HTMLParagraphElement | undefined = $state()

  $effect(() => {
    if (!paragraphRef || !text) return

    const observer = new ResizeObserver(() => {
      if (!isExpanded && paragraphRef) {
        // Ensure element is visible before measuring
        if (paragraphRef.clientHeight > 0) {
          isOverflowing = paragraphRef.scrollHeight > paragraphRef.clientHeight
        }
      }
    })

    observer.observe(paragraphRef)

    return () => observer.disconnect()
  })
</script>

{#if text}
  <div class="mb-4">
    <p
      bind:this={paragraphRef}
      class={cn('leading-relaxed', !isExpanded && 'line-clamp-(--max-lines)', classes)}
      style="--max-lines: {maxLines};"
    >
      {text}
    </p>
    {#if isOverflowing || isExpanded}
      <Button
        variant="ghost"
        size="sm"
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          isExpanded = !isExpanded
        }}
        class="mt-1 h-auto p-0 text-xs font-bold text-primary uppercase underline-offset-4 hover:bg-transparent hover:underline"
      >
        {#if isExpanded}
          Read less &#x25B5;
        {:else}
          Read More &#x25BF;
        {/if}
      </Button>
    {/if}
  </div>
{/if}
