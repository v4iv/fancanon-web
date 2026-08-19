<script lang="ts">
  import { goto } from '$app/navigation'
  import { BASE_API_URL } from '$app/env/public'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { HeartIcon } from '@lucide/svelte'

  import { cn } from '$lib/utils'
  import { track } from '$lib/analytics'
  import type { SessionUserType } from '$lib/types'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { captureException } from '@sentry/sveltekit'

  interface Props {
    commentId: string
    chapterId: string
    liked: boolean
    likesCount: number
    user?: SessionUserType
  }

  let {
    commentId,
    chapterId,
    liked = $bindable(),
    likesCount = $bindable(),
    user,
  }: Props = $props()

  const client = useQueryClient()

  const likeComment = async (): Promise<{ likes: number }> => {
    const res = await fetch(`${BASE_API_URL}/v1/comments/${commentId}/like`, {
      credentials: 'include',
    })

    return res.json()
  }

  const unlikeComment = async (): Promise<{ likes: number }> => {
    const res = await fetch(`${BASE_API_URL}/v1/comments/${commentId}/like`, {
      method: 'DELETE',
      credentials: 'include',
    })

    return res.json()
  }

  const mutationLike = createMutation(() => ({
    mutationFn: likeComment,
    onMutate: async () => {
      await client.cancelQueries()
      likesCount += 1
      liked = true

      return { likes: likesCount }
    },
    onError: (error) => {
      likesCount -= 1
      liked = false
      captureException(error)
    },
    onSettled: () => {
      track('like_comment')
      client.invalidateQueries({ queryKey: ['comments', chapterId] })
    },
  }))

  const mutationUnlike = createMutation(() => ({
    mutationFn: unlikeComment,
    onMutate: async () => {
      await client.cancelQueries()
      likesCount -= 1
      liked = false

      return { likes: likesCount }
    },
    onError: (error) => {
      likesCount += 1
      liked = true
      captureException(error)
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: ['comments', chapterId] })
    },
  }))
</script>

<Tooltip.Root>
  <Tooltip.Trigger
    class={buttonVariants({
      variant: liked ? 'secondary' : 'ghost',
      size: 'sm',
      class: 'rounded-full',
    })}
    onclick={(event) => {
      event.stopPropagation()
      event.preventDefault()
      if (user) {
        if (liked) {
          mutationUnlike.mutate()
        } else {
          mutationLike.mutate()
        }
      } else {
        goto(`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
    }}
  >
    <HeartIcon class={cn('size-4', liked ? 'fill-red-500 text-red-500' : '')} />
    {likesCount ? likesCount : ''}
    <span class="sr-only">{liked ? 'Unlike' : 'Like'}</span>
  </Tooltip.Trigger>

  <Tooltip.Content>
    <p>{liked ? 'Unlike' : 'Like'}</p>
  </Tooltip.Content>
</Tooltip.Root>
