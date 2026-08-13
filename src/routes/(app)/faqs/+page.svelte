<script lang="ts">
  import type { PageProps } from './$types'

  import { Helmet } from '$lib/components/helmet'
  import * as Accordion from '$lib/components/ui/accordion'

  let { data }: PageProps = $props()
</script>

<Helmet title={`${data.frontmatter.title} | fancanon`} />

<div class="min-h-screen">
  <div class="border-b">
    <header class="mx-auto w-full max-w-screen-lg space-y-3 px-3 py-10">
      <h1 class="font-heading text-3xl md:text-5xl">{data.frontmatter.title}</h1>
      <p class="text-md md:text-lg">{data.frontmatter.subtitle}</p>
    </header>
  </div>

  <div class="mx-auto w-full max-w-screen-lg px-3 py-5">
    <Accordion.Root type="multiple">
      {#each data.frontmatter.faqs as { question, answer }, idx (idx)}
        <Accordion.Item value={`item-${idx}`}>
          <Accordion.Trigger class="text-left text-xl font-semibold">{question}</Accordion.Trigger>
          <Accordion.Content class="text-left text-lg">{answer}</Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  </div>
</div>
