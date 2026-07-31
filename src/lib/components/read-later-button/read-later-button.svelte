<script lang="ts">
  import { goto } from '$app/navigation'
  import { toast } from 'svelte-sonner'
  import { Tooltip as TooltipPrimitive } from 'bits-ui'
  import { captureException } from '@sentry/sveltekit'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { CircleCheckBigIcon, RotateCcwClockIcon } from '@lucide/svelte'

  import { m } from '$lib/paraglide/messages.js'
  import { track } from '$lib/analytics'
  import * as Tooltip from '$lib/components/ui/tooltip'

  interface Props extends TooltipPrimitive.TriggerProps {
    storyId: string
    storyTitle?: string
    readLater: boolean
    readLaterCount: number
    user?: any
  }

  let {
    storyId,
    storyTitle,
    readLater = $bindable(),
    readLaterCount = $bindable(),
    user,
    children,
    ...restProps
  }: Props = $props()

  const client = useQueryClient()

  const addToReadLater = async (): Promise<any> => {
    const res = await fetch(`/api/stories/${storyId}/add-to-read-later`)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const removeFromReadLater = async (): Promise<any> => {
    const res = await fetch(`/api/stories/${storyId}/remove-from-read-later`, { method: 'DELETE' })

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const addMutation = createMutation(() => ({
    mutationFn: addToReadLater,
    onMutate: async () => {
      await client.cancelQueries()
      readLaterCount += 1
      readLater = true

      return { readLaterCount }
    },
    onSuccess: () => {
      toast('Added to Reading List', {
        description: `The story, '${storyTitle}' has been added to your Reading List.`,
      })
    },
    onError: (error) => {
      readLaterCount -= 1
      readLater = false

      captureException(error)
    },
    onSettled: () => {
      track('add_to_reading_list', {
        title: storyTitle,
        addedBy: user.username,
      })

      client.invalidateQueries({ queryKey: ['user'] })
      client.invalidateQueries({ queryKey: ['hot'] })
      client.invalidateQueries({ queryKey: ['new'] })
    },
  }))

  const removeMutation = createMutation(() => ({
    mutationFn: removeFromReadLater,
    onMutate: async () => {
      await client.cancelQueries()
      readLaterCount -= 1
      readLater = false

      return { readLaterCount }
    },
    onSuccess: () => {
      toast('Removed from Reading List', {
        description: `The story, '${storyTitle}' has been removed from your Reading List.`,
      })
    },

    onError: (error) => {
      readLaterCount += 1
      readLater = true

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
    disabled={addMutation.isPending || removeMutation.isPending}
    onclick={(event) => {
      event.stopPropagation()
      event.preventDefault()
      if (user) {
        if (readLater) {
          removeMutation.mutate()
        } else {
          addMutation.mutate()
        }
      } else {
        goto(`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
    }}
    {...restProps}
  >
    {#if readLater}
      <CircleCheckBigIcon class="size-4 text-primary" />
    {:else}
      <RotateCcwClockIcon class="size-4 text-muted-foreground" />
    {/if}
    {@render children?.()}
    <span class="sr-only">{readLater ? m['story.in-read-later']() : m['story.read-later']()}</span>
  </Tooltip.Trigger>

  <Tooltip.Content>
    <p>{readLater ? m['story.in-read-later']() : m['story.read-later']()}</p>
  </Tooltip.Content>
</Tooltip.Root>
