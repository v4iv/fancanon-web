<script lang="ts">
  import type { PageProps } from './$types'

  import { editStory } from '$lib/remote/story/data.remote'
  import { Helmet } from '$lib/components/helmet'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { StoryForm } from '$lib/components/forms/story-form'

  let { data }: PageProps = $props()
</script>

<Helmet title={`Edit | ${data.story.title} | fancanon`} />

<div class="min-h-screen w-full">
  <div class="mx-auto max-w-screen-lg space-y-5 px-3 py-10">
    <header class="space-y-3">
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Breadcrumb.Item>
                <Breadcrumb.Link href={`/stories/${data.story.id}`}>
                  {data.story.title.length <= 12
                    ? data.story.title
                    : `${data.story.title.slice(0, 12)}...`}
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>{data.story.title}</p>
            </Tooltip.Content>
          </Tooltip.Root>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Edit Story</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="mx-auto max-w-screen-md py-5">
        <h1 class="font-heading text-4xl">Edit Story — {data.story.title}</h1>
      </div>
    </header>
  </div>

  <div class="mx-auto w-full max-w-screen-md px-3 py-5">
    <StoryForm form={editStory} editing currentData={data.currentData} warnings={data.warnings} />
  </div>
</div>
