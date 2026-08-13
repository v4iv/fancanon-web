<script lang="ts">
  import { goto, invalidate } from '$app/navigation'
  import { Tooltip as TooltipPrimitive } from 'bits-ui'
  import * as Sentry from '@sentry/sveltekit'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { BookmarkIcon, BookmarkCheckIcon } from '@lucide/svelte'

  import * as Tooltip from '$lib/components/ui/tooltip'
  import { track } from '$lib/analytics'

  interface Props extends TooltipPrimitive.TriggerProps {
    storyTitle?: string
    storyId: string
    chapterTitle?: string
    chapterId: string
    bookmarked: boolean
    user?: any
  }

  let {
    chapterId,
    storyId,
    storyTitle,
    chapterTitle,
    bookmarked = $bindable(),
    user,
    children,
    ...restProps
  }: Props = $props()

  const client = useQueryClient()

  const bookmark = async (): Promise<any> => {
    const res = await fetch(`/api/chapters/${chapterId}/bookmark`)

    return res.json()
  }

  const removeBookmark = async (): Promise<any> => {
    const res = await fetch(`/api/chapters/${chapterId}/remove-bookmark`, { method: 'DELETE' })

    return res.json()
  }

  const bookmarkMutation = createMutation(() => ({
    mutationFn: bookmark,
    onMutate: async () => {
      await client.cancelQueries()
      bookmarked = true

      return
    },
    onError: (error) => {
      bookmarked = false
      Sentry.captureException(error)
    },
    onSettled: () => {
      track('bookmark_chapter', {
        addedBy: user.username,
        storyTitle,
        chapterTitle,
      })
      client.invalidateQueries({ queryKey: ['chapters', storyId] })
      invalidate(`/api/stories/${storyId}`)
    },
  }))

  const removeBookmarkMutation = createMutation(() => ({
    mutationFn: removeBookmark,
    onMutate: async () => {
      await client.cancelQueries()
      bookmarked = false

      return
    },
    onError: (error) => {
      bookmarked = true
      Sentry.captureException(error)
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: ['chapters', storyId] })
    },
  }))
</script>

<Tooltip.Root>
  <Tooltip.Trigger
    disabled={bookmarkMutation.isPending || removeBookmarkMutation.isPending}
    onclick={(event) => {
      event.stopPropagation()
      event.preventDefault()
      if (user) {
        if (bookmarked) {
          removeBookmarkMutation.mutate()
        } else {
          bookmarkMutation.mutate()
        }
      } else {
        goto(`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
    }}
    {...restProps}
  >
    {#if bookmarked}
      <BookmarkCheckIcon />
      {@render children?.()}
      <span class="sr-only">Remove Bookmark</span>
    {:else}
      <BookmarkIcon />
      {@render children?.()}
      <span class="sr-only">Add Bookmark</span>
    {/if}
  </Tooltip.Trigger>

  <Tooltip.Content>
    <p>{bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}</p>
  </Tooltip.Content>
</Tooltip.Root>
