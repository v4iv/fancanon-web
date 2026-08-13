<script lang="ts">
  import type { PageProps } from './$types'

  import { createNewStory } from '$lib/remote/story/data.remote'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { Helmet } from '$lib/components/helmet'
  import { StoryForm } from '$lib/components/forms/story-form'

  const { data }: PageProps = $props()
</script>

<Helmet title="Create Story | fancanon" />

<div class="min-h-screen w-full">
  <div class="mx-auto max-w-screen-lg space-y-5 px-3 py-10">
    <header class="space-y-3">
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/dashboard">My Stories</Breadcrumb.Link>
              </Breadcrumb.Item>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>My Stories</p>
            </Tooltip.Content>
          </Tooltip.Root>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>New</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="mx-auto max-w-screen-md py-5">
        <h1 class="font-heading text-4xl">New Story</h1>
      </div>
    </header>
  </div>

  <div class="mx-auto w-full max-w-screen-md px-3 py-5">
    <StoryForm form={createNewStory} warnings={data.warnings} />
  </div>
</div>
