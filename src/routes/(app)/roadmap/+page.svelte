<script lang="ts">
  import type { PageProps } from './$types'

  import * as Stepper from '$lib/components/ui/stepper'
  import { Helmet } from '$lib/components/helmet'

  let { data }: PageProps = $props()
</script>

<Helmet title={`${data.frontmatter.title} | fancanon`} />

<main class="min-h-screen">
  <div class="border-b">
    <header class="mx-auto w-full max-w-screen-lg space-y-3 px-2 py-10">
      <h1 class="font-heading text-3xl md:text-5xl">{data.frontmatter.title}</h1>
      <p class="text-md md:text-lg">{data.frontmatter.subtitle}</p>
    </header>
  </div>

  <div class="mx-auto flex max-w-screen-lg items-center justify-center px-2 py-20">
    <Stepper.Root step={data.frontmatter.step}>
      <Stepper.Nav orientation="vertical" class="w-full px-4">
        {#each data.frontmatter.steps as item, idx (idx)}
          <Stepper.Item>
            <Stepper.Trigger>
              <Stepper.Indicator>
                {item.step}
              </Stepper.Indicator>
              <div class="flex flex-col">
                <Stepper.Title>
                  {item.title}
                </Stepper.Title>
                <Stepper.Description>
                  {item.description}
                </Stepper.Description>
              </div>
            </Stepper.Trigger>
            <Stepper.Separator />
          </Stepper.Item>
        {/each}
      </Stepper.Nav>
    </Stepper.Root>
  </div>
</main>
