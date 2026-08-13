<script lang="ts">
  import type { PageProps } from './$types'

  import { Prose } from '$lib/components/prose'
  import { Helmet } from '$lib/components/helmet'

  let { data }: PageProps = $props()

  // svelte-ignore state_referenced_locally
  const effectiveDate = new Date(data.frontmatter.effectiveDate).toLocaleString('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // svelte-ignore state_referenced_locally
  const lastUpdated = new Date(data.frontmatter.lastUpdateDate).toLocaleString('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
</script>

<Helmet title={`${data.frontmatter.title} | fancanon`} />

<div class="min-h-screen">
  <div class="mx-auto mb-10 flex w-full max-w-screen-md flex-col gap-5 px-3 py-10">
    <header class="flex flex-col gap-4">
      <h1 class="font-heading text-3xl md:text-5xl">{data.frontmatter.title}</h1>

      <div class="space-y-2">
        <p class="font-mono text-sm">Effective Date: {effectiveDate}</p>

        <p class="font-mono text-sm">Last Updated: {lastUpdated}</p>
      </div>
    </header>
  </div>

  <div class="mx-auto mb-10 w-full max-w-screen-md px-3 py-5">
    <Prose>
      <data.content />
    </Prose>
  </div>
</div>
