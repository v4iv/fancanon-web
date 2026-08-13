<script lang="ts">
  import { CircleAlert } from '@lucide/svelte'

  import { reportStory } from '$lib/remote/reporting/data.remote'
  import * as Dialog from '$lib/components/ui/dialog'
  import { ReportStoryForm } from '$lib/components/forms/reporting-forms'

  interface Props {
    storyId: string
    open: boolean
    onOpenChange: () => boolean
  }

  const { storyId, open, onOpenChange }: Props = $props()
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>
        <span class="flex items-center gap-2">
          <CircleAlert class="text-red-600" /> Report Story
        </span>
      </Dialog.Title>

      <Dialog.Description>
        If you feel this story violates our <a
          class="cursor-pointer border-dashed text-primary hover:border-b"
          href="/terms-and-conditions">Terms</a
        >, report it using this form.
      </Dialog.Description>
    </Dialog.Header>

    <!-- Report Story Form -->
    <div>
      <ReportStoryForm form={reportStory} {storyId} {onOpenChange} />
    </div>
  </Dialog.Content>
</Dialog.Root>
