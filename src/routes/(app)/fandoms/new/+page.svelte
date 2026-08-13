<script lang="ts">
  import type { PageProps } from './$types'

  import { FandomForm } from '$lib/components/forms/fandom-form'
  import { Helmet } from '$lib/components/helmet'

  let { data }: PageProps = $props()
</script>

<Helmet title="Create Fandom | fancanon" />

<div class="min-h-screen w-full">
  <div class="mx-auto flex max-w-screen-md flex-col gap-5 px-3 py-10">
    <header class="space-y-3 py-5">
      <h1 class="font-heading text-4xl">Create Fandom</h1>
      <p>This may get taken down if it violates our terms of service.</p>
    </header>

    <FandomForm categories={data.categories} />
  </div>
</div>
