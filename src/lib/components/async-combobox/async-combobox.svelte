<script lang="ts" generics="TValue = string">
  import { tick } from 'svelte'
  import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, XIcon } from '@lucide/svelte'

  import { cn } from '$lib/utils'
  import * as Popover from '$lib/components/ui/popover'
  import * as Command from '$lib/components/ui/command'
  import { buttonVariants } from '$lib/components/ui/button/button.svelte'
  import { captureException } from '@sentry/sveltekit'

  export interface ComboboxOption<TValue> {
    label: string
    value: TValue
  }

  interface Props<TValue> {
    value: ComboboxOption<TValue>[]
    disabled?: boolean
    search: (query: string, signal: AbortSignal) => Promise<ComboboxOption<TValue>[]>
    placeholder?: string
    minQueryLength?: number
    debounceMs?: number
    allowCreate?: boolean
    createActionLabel?: string
    createFormPath?: string
  }

  let {
    value = $bindable([]),
    disabled = false,
    search,
    placeholder = '',
    minQueryLength = 3,
    debounceMs = 200,
    allowCreate = false,
    createActionLabel = 'Add New',
    createFormPath = '',
  }: Props<TValue> = $props()

  let query = $state('')
  let open = $state(false)
  let isLoading = $state(false)
  let hasError = $state(false)
  let triggerRef = $state<HTMLButtonElement>(null!)
  let results: ComboboxOption<TValue>[] = $state([])

  let debounceTimer: ReturnType<typeof setTimeout>
  let abortController: AbortController | null = null

  function onQueryInput() {
    clearTimeout(debounceTimer)
    hasError = false

    if (query.length < minQueryLength) {
      abortController?.abort()
      results = []
      isLoading = false
      return
    }

    isLoading = true
    debounceTimer = setTimeout(runSearch, debounceMs)
  }

  async function runSearch() {
    abortController?.abort()
    abortController = new AbortController()
    const { signal } = abortController

    try {
      const found = await search(query, signal)
      if (signal.aborted) return
      results = found
      isLoading = false
    } catch (err) {
      captureException(err)
      if (signal.aborted) return
      hasError = true
      results = []
      isLoading = false
    }
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
                value = value.filter((o) => o.value !== option.value)
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
        oninput={onQueryInput}
      />

      <Command.List>
        <Command.Group class="py-2">
          {#if isLoading}
            <Command.Item disabled>
              <LoaderCircleIcon class="size-4 animate-spin" />
              Loading...
            </Command.Item>
          {:else if hasError}
            <Command.Item disabled>Something went wrong. Try again.</Command.Item>
          {:else}
            {#each results as option, idx (idx)}
              <Command.Item
                value={option.label}
                disabled={Boolean(value.find((item) => item.value === option.value))}
                onSelect={() => {
                  value = [...value, option]
                  closeAndFocusTrigger()
                }}
              >
                {option.label}
                <CheckIcon
                  class={cn(
                    'ml-auto size-4',
                    value.find((item) => item.value === option.value) ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </Command.Item>
            {/each}
          {/if}

          {#if query.length >= minQueryLength && !isLoading && !hasError && results.length === 0}
            <Command.Item disabled>No result found.</Command.Item>
          {/if}
        </Command.Group>

        {#if allowCreate && query.length >= minQueryLength && !isLoading && results.length === 0}
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
