<script lang="ts">
  import { SearchIcon } from '@lucide/svelte'

  import { m } from '$lib/paraglide/messages.js'
  import * as InputGroup from '$lib/components/ui/input-group'
  import { Label } from '$lib/components/ui/label'

  interface Props {
    query?: string
  }

  const uid = $props.id()

  let { query = '' }: Props = $props()

  let value = $derived(query)

  const handleSubmit = () => {}

  const keydown = (e: KeyboardEvent) => {
    const target = e.target as HTMLInputElement
    if (e.key === 'Enter') {
      // prevent form submit
      e.preventDefault()

      handleSubmit()
      return
    }
  }
</script>

<InputGroup.Root class="rounded-full">
  <Label for={`search-${uid}`} class="sr-only">{m['navbar.search-label']()}</Label>

  <InputGroup.Input
    id={`search-${uid}`}
    bind:value
    onkeydown={keydown}
    placeholder={m['navbar.search-placeholder']()}
  />

  <InputGroup.Addon>
    <SearchIcon />
  </InputGroup.Addon>

  <InputGroup.Addon align="inline-end">
    <InputGroup.Button
      variant="secondary"
      class="rounded-full hover:bg-primary hover:text-primary-foreground"
    >
      {m['navbar.search-label']()}
    </InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>
