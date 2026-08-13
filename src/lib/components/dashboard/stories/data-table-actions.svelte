<script lang="ts">
  import { invalidate } from '$app/navigation'
  import { BASE_API_URL } from '$app/env/public'
  import { toast } from 'svelte-sonner'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { captureException } from '@sentry/sveltekit'

  import { Button } from '$lib/components/ui/button'
  import { PencilIcon, PlusIcon, Trash2Icon } from '@lucide/svelte'

  let { id }: { id: string } = $props()

  const deleteStory = async (storyId: string): Promise<any> => {
    const res = await fetch(`${BASE_API_URL}/v1/stories/${storyId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const client = useQueryClient()

  const deleteStoryMutation = createMutation(() => ({
    mutationFn: (storyId: string) => deleteStory(storyId),
    onMutate: async () => {
      await client.cancelQueries()

      return
    },
    onSuccess: () => {
      toast('Story Deleted', {
        description: `The story has been deleted.`,
      })
    },
    onError: (error) => {
      toast('Error Deleting Story', {
        description: `There was an error deleting the story'.`,
      })
      captureException(error)
    },
    onSettled: () => {
      invalidate('/api/dashboard/stories')
      client.invalidateQueries({ queryKey: ['user'] })
      client.invalidateQueries({ queryKey: ['hot'] })
      client.invalidateQueries({ queryKey: ['new'] })
    },
  }))
</script>

<div class="hidden items-center gap-2 md:flex">
  <Button variant="outline" href={`/stories/${id}/chapters/new`}>
    <PlusIcon />
    New Chapter
  </Button>

  <Button variant="secondary" href={`/stories/${id}/edit`}>
    <PencilIcon />
    Edit
  </Button>

  <Button
    variant="destructive"
    onclick={(event) => {
      event.stopPropagation()
      event.preventDefault()
      const confirmDelete = confirm('Are you sure you want to delete this story?')

      if (confirmDelete) {
        deleteStoryMutation.mutate(id)
      } else {
        event.preventDefault()
      }
    }}
  >
    <Trash2Icon class="text-destructive" />
    <span>Delete</span>
  </Button>
</div>

<div class="flex items-center gap-2 md:hidden">
  <Button variant="outline" href={`/stories/${id}/chapters/new`}>
    <PlusIcon />
    <span>New Chapter</span>
  </Button>

  <Button variant="secondary" size="icon-lg" class="rounded-full" href={`/stories/${id}/edit`}>
    <PencilIcon />
    <span class="sr-only">Edit</span>
  </Button>

  <Button
    variant="destructive"
    size="icon-lg"
    class="rounded-full"
    onclick={(event) => {
      event.stopPropagation()
      event.preventDefault()
      const confirmDelete = confirm('Are you sure you want to delete this story?')

      if (confirmDelete) {
        deleteStoryMutation.mutate(id)
      } else {
        event.preventDefault()
      }
    }}
  >
    <Trash2Icon class="text-destructive" />
    <span class="sr-only">Delete Story</span>
  </Button>
</div>
