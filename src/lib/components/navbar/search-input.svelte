<script lang="ts">
  import { SearchIcon } from '@lucide/svelte'

  import * as InputGroup from '$lib/components/ui/input-group'
  import { Label } from '$lib/components/ui/label'
</script>

<InputGroup.Root class="rounded-full">
  <Label for="search" class="sr-only">Search</Label>

  <InputGroup.Input id="search" placeholder="Search..." />

  <InputGroup.Addon>
    <SearchIcon />
  </InputGroup.Addon>

  <InputGroup.Addon align="inline-end"></InputGroup.Addon>
</InputGroup.Root>
