<script lang="ts">
  import { SearchIcon } from '@lucide/svelte'

  import * as InputGroup from '$lib/components/ui/input-group'
</script>

<InputGroup.Root class="rounded-full">
  <InputGroup.Label for="search" class="sr-only">Search</InputGroup.Label>

  <InputGroup.Input id="search" placeholder="Search..." />

  <InputGroup.Addon>
    <SearchIcon />
  </InputGroup.Addon>

  <InputGroup.Addon align="inline-end"></InputGroup.Addon>
</InputGroup.Root>
