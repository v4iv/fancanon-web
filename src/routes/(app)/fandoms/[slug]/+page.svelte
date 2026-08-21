<script lang="ts">
  import { page } from '$app/state'
  import type { PageProps } from './$types'
  import { Crown } from '@lucide/svelte'

  import { Helmet } from '$lib/components/helmet'
  import Badge from '$lib/components/ui/badge/badge.svelte'
  import { UniversalFeed } from '$lib/components/feed'
  import { CollapsibleText } from '$lib/components/collapsible-text'
  import { BASE_API_URL } from '$app/env/public'

  let { data }: PageProps = $props()

  const slug = $derived(page.params.slug ?? '')

  let api = $derived(`${BASE_API_URL}/v1/fandoms/${slug}`)
</script>

<Helmet title={`${data.fandom.name} | Fandoms | fancanon`} />

<div class="min-h-screen w-full">
  <header class="mx-auto w-full max-w-screen-lg space-y-3 px-3 py-10">
    <h1 class="flex items-center gap-2 font-heading text-3xl md:text-5xl">
      <Crown class="size-6 md:size-8" />
      {data.fandom.name}
    </h1>

    <div>
      <a href={`/categories/${data.fandom.category?.slug}`}>
        <Badge>{data.fandom.category?.name}</Badge>
      </a>
    </div>

    <CollapsibleText maxLines={2} text={data.fandom?.description} classes="text-md md:text-lg" />
  </header>

  <UniversalFeed {api} queryKeys={['fandom', slug]} />
</div>
