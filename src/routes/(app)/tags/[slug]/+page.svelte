<script lang="ts">
  import type { PageProps } from './$types'
  import { page } from '$app/state'
  import { BASE_API_URL } from '$app/env/public'
  import { Hash, HashIcon, LinkIcon } from '@lucide/svelte'

  import { Helmet } from '$lib/components/helmet'
  import { UniversalFeed } from '$lib/components/feed'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'

  let { data }: PageProps = $props()

  const slug = $derived(page.params.slug ?? '')

  let api = $derived(`${BASE_API_URL}/v1/tags/${encodeURIComponent(slug)}`)
</script>

<Helmet title={`#${data.tag.name} | Tags | fancanon`} />

<div class="min-h-screen w-full">
  <header class="mx-auto w-full max-w-screen-lg space-y-5 px-3 py-5">
    <h1 class="flex items-center font-heading text-3xl md:text-5xl">
      <Hash class="size-6 md:size-8" />{data.tag.name}
    </h1>

    <div class="flex items-center">
      {#if data.tag.type === 'FREEFORM'}
        <Badge variant="outline">OTHER</Badge>
      {:else if data.tag.type === 'FANDOM_FREEFORM'}
        <Badge variant="secondary">FANDOM</Badge>
      {:else}
        <Badge variant={data.tag.type === 'WARNING' ? 'destructive' : 'default'}>
          {data.tag.type}
        </Badge>
      {/if}
    </div>

    {#if data.tag.usageCount > 1}
      <p class="text-md md:text-lg">
        {data.tag.usageCount} stories tagged with '{data.tag.name}'
      </p>
    {:else}
      <p class="text-md md:text-lg">
        {data.tag.usageCount} story tagged with '{data.tag.name}'
      </p>
    {/if}

    <div class="space-y-3 rounded-xl border p-3">
      <div class="flex items-center gap-2">
        <LinkIcon class="size-4" />
        <p class="font-heading font-semibold uppercase">Synonyms</p>
      </div>

      <div class="flex items-center gap-2">
        {#if data.tag.synonyms.length === 0}
          <span class="px-2 text-muted-foreground">—</span>
        {:else}
          {#each data.tag.synonyms as synonym, idx (idx)}
            <Button
              variant="link"
              href={`/tags/${synonym.slug}`}
              class="gap-1/2 rounded-full px-2 hover:text-muted-foreground md:first:pl-0"
            >
              <HashIcon />
              {synonym.name} ({synonym.usageCount} usage(s))
            </Button>
          {/each}
        {/if}
      </div>
    </div>
  </header>

  <UniversalFeed {api} queryKeys={['tags', slug]} />
</div>
