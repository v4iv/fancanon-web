<script lang="ts">
  import { goto, invalidate } from '$app/navigation'
  import { Tooltip as TooltipPrimitive } from 'bits-ui'
  import { BASE_API_URL } from '$app/env/public'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { BookmarkIcon, BookmarkCheckIcon } from '@lucide/svelte'
  import { captureException } from '@sentry/sveltekit'

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
    const res = await fetch(`${BASE_API_URL}/v1/chapters/${chapterId}/bookmark`, {
      credentials: 'include',
    })

    return res.json()
  }

  const removeBookmark = async (): Promise<any> => {
    const res = await fetch(`${BASE_API_URL}/v1/chapters/${chapterId}/bookmark`, {
      method: 'DELETE',
      credentials: 'include',
    })

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
      captureException(error)
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
      captureException(error)
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
