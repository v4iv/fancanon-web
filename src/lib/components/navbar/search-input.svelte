<script lang="ts">
  import { SearchIcon } from '@lucide/svelte'

  import { m } from '$lib/paraglide/messages.js'
  import * as InputGroup from '$lib/components/ui/input-group'
  import { Label } from '$lib/components/ui/label'
</script>

<InputGroup.Root class="rounded-full">
  <Label for="search" class="sr-only">{m['navbar.search-label']()}</Label>

  <InputGroup.Input id="search" placeholder={m['navbar.search-placeholder']()} />

  <InputGroup.Addon>
    <SearchIcon />
  </InputGroup.Addon>

  <InputGroup.Addon align="inline-end"></InputGroup.Addon>
</InputGroup.Root>
