<script lang="ts">
  import { AutocompleteItem } from 'prosekit/svelte/autocomplete'
  interface Props {
    label: string
    kbd?: string
    onSelect: () => void
  }
  const props: Props = $props()
</script>

<AutocompleteItem
  class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between rounded-md px-3 py-1.5 text-sm whitespace-nowrap outline-hidden select-none data-highlighted:bg-gray-100 dark:data-highlighted:bg-gray-800"
  onSelect={props.onSelect}
>
  <span>{props.label}</span>{#if props.kbd}<kbd
      class="font-mono text-xs text-gray-400 dark:text-gray-500">{props.kbd}</kbd
    >{/if}
</AutocompleteItem>
