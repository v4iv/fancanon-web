<script lang="ts">
  import { SearchIcon } from '@lucide/svelte'
  import { goto } from '$app/navigation'

  import { m } from '$lib/paraglide/messages.js'
  import * as ButtonGroup from '$lib/components/ui/button-group'
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'

  interface Props {
    query: string | null
    open?: boolean
  }

  const uid = $props.id()

  // eslint-disable-next-line no-useless-assignment
  let { query = '', open = $bindable(false) }: Props = $props()

  let value = $derived(query)

  const handleSubmit = () => {
    const trimmed = value?.trim() ?? ''
    if (!trimmed) return
    open = false
    goto(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const keydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // prevent form submit
      e.preventDefault()
      handleSubmit()
    }
  }
</script>

<ButtonGroup.Root class="w-full">
  <Input
    bind:value
    type="search"
    onkeydown={keydown}
    id={`search-${uid}`}
    aria-label={m['navbar.search-label']()}
    placeholder={m['navbar.search-placeholder']()}
  />

  <Button
    variant="outline"
    size="icon"
    onclick={handleSubmit}
    aria-label={m['navbar.search-label']()}
  >
    <SearchIcon />
  </Button>
</ButtonGroup.Root>
