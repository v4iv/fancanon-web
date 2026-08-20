<script lang="ts">
  import { ArrowLeftIcon } from '@lucide/svelte'

  import { type CommentType, type UserType } from '$lib/types'
  import { Button } from '$lib/components/ui/button'
  import { CommentItem } from './index'

  interface Props {
    comment: CommentType
    user?: UserType
    onViewThread: (c: CommentType) => any
    onBack: () => void
  }

  let { comment, user, onBack, onViewThread }: Props = $props()
</script>

<div class="space-y-4">
  <div class="flex items-center gap-2 border-b pb-2">
    <Button variant="ghost" size="sm" onclick={onBack}>
      <ArrowLeftIcon class="mr-2 size-4" />
      Back to all comments
    </Button>
  </div>

  <div>
    <CommentItem {comment} {user} isInThreadView={true} {onViewThread} />
  </div>
</div>
