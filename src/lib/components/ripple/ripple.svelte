<script lang="ts">
  /** adapted for svelte from https://magicui.design/docs/components/ripple */
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    mainCircleSize?: number
    mainCircleOpacity?: number
    numCircles?: number
    borderStyle?: string
  }

  let {
    mainCircleOpacity = 0.24,
    mainCircleSize = 210,
    numCircles = 8,
    borderStyle = 'solid',
    class: className,
    ...restProps
  }: Props = $props()
</script>

<div
  class={cn(
    'pointer-events-none absolute inset-0 overflow-hidden mask-[linear-gradient(to_bottom,white,transparent)] select-none',
    className,
  )}
  {...restProps}
>
  {#each Array.from({ length: numCircles }) as _, idx (idx)}
    {@const size = mainCircleSize + idx * 70}
    {@const opacity = mainCircleOpacity - idx * 0.03}
    {@const animationDelay = `${idx * 0.06}s`}
    <div
      class={`absolute animate-ripple rounded-full border bg-foreground/25 shadow-xl [--i:${idx}]`}
      style={`width:${size}px; height:${size}px; opacity:${opacity}; animation-delay:${animationDelay}; border-style:${borderStyle}; border-width:1px; border-color:hsl(var(--foreground)); top:50%; left:50%; transform:translate(-50%, -50%) scale(1);`}
    ></div>
  {/each}
</div>
