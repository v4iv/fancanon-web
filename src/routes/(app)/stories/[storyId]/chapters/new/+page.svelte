<script lang="ts">
  import type { PageProps } from './$types'

  import { addNewChapter } from '$lib/remote/chapter/data.remote'
  import { Helmet } from '$lib/components/helmet'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { ChapterForm } from '$lib/components/forms/chapter-form'

  let { data }: PageProps = $props()
</script>

<Helmet title="New Chapter | fancanon" />

<div class="min-h-screen">
  <div class="mx-auto max-w-screen-lg space-y-5 px-3 py-10">
    <header class="space-y-3">
      <Breadcrumb.Root class="grow">
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
            <Breadcrumb.Page>Add Chapter</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="mx-auto max-w-screen-md py-5">
        <h1 class="font-heading text-4xl">Add New Chapter</h1>
      </div>
    </header>
  </div>

  <div class="mx-auto w-full max-w-screen-md px-3 py-5">
    <ChapterForm form={addNewChapter} storyCompleted={data.story.completed} />
  </div>
</div>
