<script lang="ts">
  import { CircleAlert } from '@lucide/svelte'

  import * as Dialog from '$lib/components/ui/dialog'
  import { ReportCommentForm } from '$lib/components/forms/reporting-forms'

  interface Props {
    commentId: string
    chapterId: string
    open: boolean
    onOpenChange: () => boolean
  }

  const { commentId, chapterId, open, onOpenChange }: Props = $props()
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>
        <span class="flex items-center gap-2">
          <CircleAlert class="text-red-600" /> Report Comment
        </span>
      </Dialog.Title>

      <Dialog.Description>
        If you feel this Comment violates our <a
          class="cursor-pointer border-dashed text-primary hover:border-b"
          href="/terms-and-conditions">Terms</a
        >, report it using this form.
      </Dialog.Description>
    </Dialog.Header>

    <!-- Report Form -->
    <div>
      <ReportCommentForm {commentId} {chapterId} {onOpenChange} />
    </div>
  </Dialog.Content>
</Dialog.Root>
