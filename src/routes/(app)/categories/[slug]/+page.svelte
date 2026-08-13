<script lang="ts">
  import type { PageProps } from './$types'
  import { numify } from 'numify'
  import { CrownIcon } from '@lucide/svelte'

  import * as Item from '$lib/components/ui/item'
  import { Separator } from '$lib/components/ui/separator'
  import { Helmet } from '$lib/components/helmet'

  let { data }: PageProps = $props()
</script>

<Helmet title={`${data.category.name} | Categories | fancanon`} />

<div class="relative min-h-screen w-full">
  <header class="mx-auto w-full max-w-screen-lg space-y-3 px-3 py-10">
    <h1 class="font-heading text-3xl md:text-5xl">{data.category?.name}</h1>

    <p class="text-md md:text-lg">{data.category?.description}</p>
  </header>

  <div class="border-y py-3">
    <div class="mx-auto w-full max-w-screen-lg px-3">
      <div class="flex h-6 items-center space-x-4">
        <p class="font-mono text-sm">Fandoms: {numify(data.count)}</p>

        <Separator orientation="vertical" />
      </div>
    </div>
  </div>

  <div class="mx-auto w-full max-w-screen-lg space-y-3 px-3 py-5">
    {#if data.fandoms.length < 1}
      <div class="py-12 text-center">
        <CrownIcon class="mx-auto mb-4 size-12 text-muted-foreground" />
        <h3 class="mb-2 font-heading text-2xl">No Fandoms Found</h3>
        <p class="text-muted-foreground">
          It looks like there are no fandoms in this category right now.
        </p>
      </div>
    {/if}

    {#each data.fandoms as fandom (fandom.id)}
      <Item.Root variant="outline" class="items-center">
        {#snippet child({ props })}
          <a href={`/fandoms/${fandom.slug}`} {...props}>
            <Item.Media>
              <CrownIcon class="size-6" />
            </Item.Media>

            <Item.Content>
              <Item.Title class="text-xl">{fandom.name}</Item.Title>
            </Item.Content>

            <Item.Content>
              <Item.Description>
                Stories: {numify(fandom.storyCount)}
              </Item.Description>
            </Item.Content>
          </a>
        {/snippet}
      </Item.Root>
    {/each}
  </div>
</div>
