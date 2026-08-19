<script lang="ts">
  import { toast } from 'svelte-sonner'
  import * as Sentry from '@sentry/sveltekit'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { CopyIcon, EllipsisIcon, FlagIcon, Trash2Icon } from '@lucide/svelte'

  import { buttonVariants } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { ReportComment } from '$lib/components/reporting'
  import { BASE_API_URL } from '$app/env/public'

  interface Props {
    commentId: string
    chapterId: string
    text: string
    isAuthor: boolean
  }

  let { commentId, chapterId, text, isAuthor }: Props = $props()

  let openReportDialog = $state(false)

  const client = useQueryClient()

  const deleteComment = async (): Promise<any> => {
    const res = await fetch(`${BASE_API_URL}/v1/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    return res.json()
  }

  const mutationDelete = createMutation(() => ({
    mutationFn: deleteComment,
    onMutate: async () => {
      await client.cancelQueries()

      return
    },
    onSuccess: () => {
      toast('Comment Deleted', {
        description: 'The comment has been deleted.',
      })
    },
    onError: (error) => {
      toast('Error Deleting Comment', {
        description: 'There was an error deleting the Comment.',
      })
      Sentry.captureException(error)
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: ['comments', chapterId] })
    },
  }))
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'rounded-full' })}
      >
        <EllipsisIcon />
        <span class="sr-only">Options</span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content class="w-full">
        <DropdownMenu.Item
          class="cursor-pointer"
          onclick={() => {
            navigator.clipboard.writeText(text)
            toast('Comment text copied to clipboard.')
          }}
        >
          <CopyIcon class="mr-2" />
          Copy Comment Text
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          {#if isAuthor}
            <DropdownMenu.Item
              class="cursor-pointer"
              variant="destructive"
              onclick={(event) => {
                const confirmDelete = confirm('Are you sure you want to delete this comment?')

                if (confirmDelete) {
                  mutationDelete.mutate()
                } else {
                  event.preventDefault()
                }
              }}
            >
              <Trash2Icon class="mr-2" />
              <span>Delete</span>
            </DropdownMenu.Item>
          {:else}
            <DropdownMenu.Item
              variant="destructive"
              class="cursor-pointer"
              onclick={() => (openReportDialog = !openReportDialog)}
            >
              <FlagIcon class="mr-2" />
              <span>Report</span>
            </DropdownMenu.Item>
          {/if}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Tooltip.Trigger>

  <Tooltip.Content>
    <p>Options</p>
  </Tooltip.Content>
</Tooltip.Root>

<ReportComment
  {commentId}
  {chapterId}
  open={openReportDialog}
  onOpenChange={() => (openReportDialog = !openReportDialog)}
/>
