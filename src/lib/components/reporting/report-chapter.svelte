<script lang="ts">
  import { CircleAlert } from '@lucide/svelte'

  import * as Dialog from '$lib/components/ui/dialog'
  import { ReportChapterForm } from '$lib/components/forms/reporting-forms'

  interface Props {
    storyId: string
    chapterId: string
    open: boolean
    onOpenChange: () => boolean
  }

  const { storyId, chapterId, open, onOpenChange }: Props = $props()
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>
        <span class="flex items-center gap-2">
          <CircleAlert class="text-red-600" /> Report Chapter
        </span>
      </Dialog.Title>

      <Dialog.Description>
        If you feel this Chapter violates our <a
          class="cursor-pointer border-dashed text-primary hover:border-b"
          href="/terms-and-conditions">Terms</a
        >, report it using this form.
      </Dialog.Description>
    </Dialog.Header>

    <!-- Report Form -->
    <div>
      <ReportChapterForm {storyId} {chapterId} {onOpenChange} />
    </div>
  </Dialog.Content>
</Dialog.Root>
