<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import {
    TooltipPopup,
    TooltipPositioner,
    TooltipRoot,
    TooltipTrigger,
  } from 'prosekit/svelte/tooltip'

  interface Props {
    pressed?: boolean
    disabled?: boolean
    onClick?: () => void
    tooltip?: string
    children?: import('svelte').Snippet
  }

  const props: Props = $props()
  const pressed = $derived(props.pressed ?? false)
  const disabled = $derived(props.disabled ?? false)
</script>

<TooltipRoot>
  <TooltipTrigger class="block">
    <Button
      {disabled}
      size="icon"
      type="button"
      variant="ghost"
      class="data-[state=on]:bg-gray-200 dark:data-[state=on]:bg-gray-700"
      data-state={pressed ? 'on' : 'off'}
      onclick={props.onClick}
      onmousedown={(e) => e.preventDefault()}
    >
      {@render props.children?.()}
      {#if props.tooltip}
        <span class="sr-only">{props.tooltip}</span>
      {/if}
    </Button>
  </TooltipTrigger>

  {#if props.tooltip}
    <TooltipPositioner
      class="z-50 block h-min w-min overflow-visible transition-transform duration-100 ease-out motion-reduce:transition-none"
    >
      <TooltipPopup
        class="box-border flex origin-(--transform-origin) overflow-hidden rounded-md border border-solid bg-gray-900 px-3 py-1.5 text-xs text-nowrap text-gray-50 shadow-xs transition-[opacity,scale] transition-discrete duration-100 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 motion-reduce:transition-none dark:bg-gray-50 dark:text-gray-900 starting:scale-95 starting:opacity-0"
      >
        {props.tooltip}
      </TooltipPopup>
    </TooltipPositioner>
  {/if}
</TooltipRoot>
