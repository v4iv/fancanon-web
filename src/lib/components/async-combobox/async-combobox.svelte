<script lang="ts">
  import { tick } from 'svelte'
  import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, XIcon } from '@lucide/svelte'

  import { cn } from '$lib/utils'
  import * as Popover from '$lib/components/ui/popover'
  import * as Command from '$lib/components/ui/command'
  import { buttonVariants } from '$lib/components/ui/button/button.svelte'

  interface Props {
    value: any[]
    disabled?: boolean
    searchAPI: string
    placeholder?: string
    allowCreate?: boolean
    createActionLabel?: string
    createFormPath?: string
    // onValueChange?: (value: string[]) => void
  }

  let {
    value = $bindable([]),
    disabled = false,
    searchAPI,
    placeholder = '',
    allowCreate = false,
    createActionLabel = 'Add New',
    createFormPath = '',
  }: Props = $props()

  let query = $state('')
  let open = $state(false)
  let isLoading = $state(false)
  let triggerRef = $state<HTMLButtonElement>(null!)
  let options: {
    results: {
      label: string
      value: string
    }[]
  } = $state({ results: [] })

  async function typeaheadSearch() {
    if (query.length < 3) return

    isLoading = true

    const res = await fetch(`${searchAPI}=${query}`)
    const data = await res.json()

    isLoading = false

    options = data
  }

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger() {
    open = false
    tick().then(() => {
      triggerRef.focus()
    })
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    class={cn(
      buttonVariants({ variant: 'outline', size: 'lg' }),
      'w-full px-3 hover:bg-muted/50',
      !value.length && 'text-muted-foreground',
    )}
    role="combobox"
    {disabled}
    bind:ref={triggerRef}
  >
    {#if value.length}
      <div class="flex grow items-center gap-2 overflow-x-auto">
        {#each value as option, idx (idx)}
          <div class="flex items-center gap-1 rounded border px-2">
            <span>{option.label}</span>
            <button
              class="hover:bg-muted"
              onclick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                //remove option from remoteForm
                value = value.filter((o: { value: string }) => o.value !== option.value)
              }}
            >
              <XIcon />

              <span class="sr-only">Remove</span>
            </button>
          </div>
        {/each}
      </div>
    {:else}
      <span class="grow text-left">{placeholder}</span>
    {/if}

    <ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
  </Popover.Trigger>

  <Popover.Content class="p-0">
    <Command.Root shouldFilter={false}>
      <Command.Input
        autofocus
        placeholder="Search..."
        class="h-9"
        bind:value={query}
        oninput={typeaheadSearch}
      />

      <Command.List>
        <Command.Group class="py-2">
          {#if isLoading}
            <Command.Item disabled>
              <LoaderCircleIcon class="size-4 animate-spin" />
              Loading...
            </Command.Item>
          {:else}
            {#each options.results as option, idx (idx)}
              <Command.Item
                value={option.value}
                disabled={Boolean(
                  value.find((item: { value: string }) => item.value === option.value),
                )}
                onSelect={() => {
                  value = [...value, option]
                  closeAndFocusTrigger()
                }}
              >
                {option.label}
                <CheckIcon
                  class={cn(
                    'ml-auto size-4',
                    value.find((item: { value: string }) => item.value === option.value)
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
              </Command.Item>
            {/each}
          {/if}

          {#if query.length >= 3 && !isLoading && options.results.length === 0}
            <Command.Item disabled>No result found.</Command.Item>
          {/if}
        </Command.Group>

        {#if allowCreate && query.length >= 3 && !isLoading && options.results.length === 0}
          <Command.Separator />

          <Command.Group>
            <Command.Item>
              <a
                class={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}
                href={createFormPath}
              >
                {createActionLabel}
              </a>
            </Command.Item>
          </Command.Group>
        {/if}
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
