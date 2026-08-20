<script lang="ts">
  import { goto } from '$app/navigation'
  import { BASE_API_URL } from '$app/env/public'
  import { formatDistanceToNow } from 'date-fns'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { DeleteIcon, RotateCcwClockIcon, UserRoundIcon } from '@lucide/svelte'
  import { captureException } from '@sentry/sveltekit'

  import { m } from '$lib/paraglide/messages'
  import { track } from '$lib/analytics'
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'

  interface Props {
    story: {
      id: string
      title: string
      author: {
        username: string
      }
    }
    chapter: {
      id: string
      title: string
      chapterIndex: string
    }
    lastViewedAt: string
  }

  const { story, chapter, lastViewedAt }: Props = $props()

  const client = useQueryClient()

  let open = $state(false)

  const deleteHistoryMutation = createMutation(() => ({
    mutationFn: async () => {
      const res = await fetch(`${BASE_API_URL}/v1/history/${chapter.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      return res.json()
    },
    onMutate: async () => {
      await client.cancelQueries()

      return
    },
    onError: (error) => {
      captureException(error)
    },
    onSettled: () => {
      track('delete_history', {
        title: story.title,
      })
      client.invalidateQueries({ queryKey: ['user', 'history'] })
    },
  }))

  // svelte-ignore state_referenced_locally
  const timestamp = 'Last Viewed: ' + formatDistanceToNow(new Date(lastViewedAt)) + ' ago'
</script>

<Card.Root
  class="w-full cursor-pointer transition-shadow duration-200 hover:bg-muted/50 hover:shadow-md dark:hover:bg-input/30"
  onclick={() => {
    goto(`/stories/${story.id}/chapters/${chapter.chapterIndex}`)
  }}
>
  <Card.Header>
    <Card.Title class="flex w-full items-center justify-between">
      {story.title}
      <Button
        variant="ghost"
        size="icon-lg"
        class="rounded-full"
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          open = !open
        }}
      >
        <DeleteIcon class="text-destructive" />
        <span class="sr-only">Delete</span>
      </Button>
    </Card.Title>

    <div class="text-sm">
      <a
        href={`/user/${story.author?.username}`}
        class="flex w-fit items-center gap-2 p-0 font-mono tracking-wide text-primary underline-offset-4 hover:text-muted-foreground hover:underline"
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          goto(`/user/${story.author?.username}`)
        }}
      >
        <UserRoundIcon class="size-4" />

        <span>@{story.author?.username}</span>
      </a>
    </div>
  </Card.Header>

  <Card.Footer>
    <div class="space-y-3">
      <p class="flex items-center gap-2 font-heading text-xl font-semibold">
        <span class="font-bold">{m['story.chapter-index']({ index: chapter.chapterIndex })}</span>

        <span>
          {chapter.title.length ? `: ${chapter.title}` : ''}
        </span>
      </p>

      <div class="flex items-center gap-2 text-xs">
        <RotateCcwClockIcon class="size-3 text-muted-foreground" />

        <p class="text-muted-foreground">
          {timestamp}
        </p>
      </div>
    </div>
  </Card.Footer>
</Card.Root>

<AlertDialog.Root bind:open>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This action cannot be undone. This will permanently delete this chapter from your history.</AlertDialog.Description
      >
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>

      <AlertDialog.Action
        onclick={() => {
          deleteHistoryMutation.mutate()
          open = false
        }}
      >
        Continue
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
