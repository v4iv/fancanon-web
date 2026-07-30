<script lang="ts">
  import type { PageProps } from './$types'

  import { Helmet } from '$lib/components/helmet'
  import { Prose } from '$lib/components/prose'

  let { data }: PageProps = $props()
</script>

<Helmet title={`${data.frontmatter.title} | fancanon`} />

<div class="min-h-screen">
  <div class="mx-auto mb-10 flex w-full max-w-screen-md flex-col gap-5 px-2 py-10">
    <header class="flex flex-col gap-4">
      <h1 class="font-heading text-3xl md:text-5xl">{data.frontmatter.title}</h1>

      <p>{data.frontmatter.description}</p>
    </header>
  </div>

  <div class="mx-auto mb-10 w-full max-w-screen-md px-2 py-5">
    <Prose>
      <data.content />
    </Prose>
  </div>
</div>
