<script lang="ts">
  import { goto } from '$app/navigation'
  import { BASE_API_URL } from '$app/env/public'
  import type { Tooltip as TooltipPrimitive } from 'bits-ui'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { captureException } from '@sentry/sveltekit'
  import { HeartIcon } from '@lucide/svelte'

  import { track } from '$lib/analytics'
  import { m } from '$lib/paraglide/messages.js'
  import * as Tooltip from '$lib/components/ui/tooltip'

  interface Props extends TooltipPrimitive.TriggerProps {
    storyId: string
    storyTitle?: string
    like: boolean
    likesCount: number
    user?: any
  }

  let {
    storyId,
    storyTitle,
    like = $bindable(),
    likesCount = $bindable(),
    user,
    children,
    ...restProps
  }: Props = $props()

  const client = useQueryClient()

  const likeStory = async (): Promise<any> => {
    const res = await fetch(`${BASE_API_URL}/v1/stories/${storyId}/like`, {
      credentials: 'include',
    })

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const unlikeStory = async (): Promise<{ likes: number }> => {
    const res = await fetch(`${BASE_API_URL}/v1/stories/${storyId}/like`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const likeMutation = createMutation(() => ({
    mutationFn: likeStory,
    onMutate: async () => {
      await client.cancelQueries()
      likesCount += 1
      like = true

      return { likes: likesCount }
    },
    onError: (error) => {
      likesCount -= 1
      like = false
      captureException(error)
    },
    onSettled: () => {
      track('like_story', {
        title: storyTitle,
        likedBy: user.username,
      })

      client.invalidateQueries({ queryKey: ['user'] })
      client.invalidateQueries({ queryKey: ['hot'] })
      client.invalidateQueries({ queryKey: ['new'] })
    },
  }))

  const unlikeMutation = createMutation(() => ({
    mutationFn: unlikeStory,
    onMutate: async () => {
      await client.cancelQueries()
      likesCount -= 1
      like = false

      return { likes: likesCount }
    },
    onError: (error) => {
      likesCount += 1
      like = true
      captureException(error)
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: ['user'] })
      client.invalidateQueries({ queryKey: ['hot'] })
      client.invalidateQueries({ queryKey: ['new'] })
    },
  }))
</script>

<Tooltip.Root>
  <Tooltip.Trigger
    disabled={likeMutation.isPending || unlikeMutation.isPending}
    onclick={(event) => {
      event.stopPropagation()
      event.preventDefault()

      if (user) {
        if (like) {
          unlikeMutation.mutate()
        } else {
          likeMutation.mutate()
        }
      } else {
        goto(`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
    }}
    {...restProps}
  >
    <HeartIcon class={like ? 'size-4 fill-red-500 text-red-500' : 'size-4 text-muted-foreground'} />
    {@render children?.()}
    <span class="sr-only">{like ? m['story.unlike-story']() : m['story.like-story']()}</span>
  </Tooltip.Trigger>

  <Tooltip.Content>
    <p>{like ? m['story.unlike-story']() : m['story.like-story']()}</p>
  </Tooltip.Content>
</Tooltip.Root>
