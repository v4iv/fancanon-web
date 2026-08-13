<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { goto } from '$app/navigation'
  import { isHttpError, type RemoteForm } from '@sveltejs/kit'
  import { useQueryClient } from '@tanstack/svelte-query'
  import { CircleIcon } from '@lucide/svelte'
  import { captureException } from '@sentry/sveltekit'

  import { track } from '$lib/analytics'
  import * as Field from '$lib/components/ui/field'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Switch } from '$lib/components/ui/switch'
  import { Editor } from '$lib/components/editor'
  import { schema } from '$lib/components/forms/chapter-form'

  interface Props {
    form: RemoteForm<any, any>
    storyCompleted: boolean
    editing?: boolean
    currentData?: {
      title?: string
      content: string
      completed: boolean
    }
  }

  const { form, storyCompleted, editing = false, currentData }: Props = $props()

  let { enhance, fields, preflight } = $derived(form)

  const client = useQueryClient()

  let submitting = $state(false)
  let completed = $derived(storyCompleted)

  // svelte-ignore state_referenced_locally
  if (editing && currentData) fields.set({ ...currentData })

  let content = $derived.by(() => {
    if (editing && currentData) return currentData.content

    return ''
  })
</script>

<form
  class="space-y-4"
  {...preflight(schema)}
  {...enhance(async ({ element, submit }: any) => {
    try {
      submitting = true

      const res = await submit()

      if (res) {
        if (editing) {
          track('edit_chapter')
        } else {
          track('create_chapter')
        }
        element.reset()
        client.invalidateQueries({ queryKey: ['chapters'] })
        toast.success('Success!', { description: 'Chapter added successfully' })
        goto(`/stories/${form.result.storyId}/chapters/${form.result.chapterIndex}`)
      }
    } catch (err) {
      captureException(err)
      // TODO(remote-forms): don't branch on err.status inside enhance() — SvelteKit
      // remote form functions currently normalize all caught errors to status 500
      // regardless of the real thrown status (sveltejs/kit#14256). err.body.message
      // still carries the correct text, which is all we rely on today. Revisit if
      // this issue closes, or if we need real status-based branching later.
      if (isHttpError(err)) {
        toast.error('Error!', { description: err.body.message })
      } else {
        toast.error('Error!', { description: 'Something, went wrong.' })
      }
    } finally {
      submitting = false
    }
  })}
>
  <Field.Group>
    <!-- Title -->
    <Field.Field>
      <Field.Label for="title">Title</Field.Label>

      <Input
        id="title"
        placeholder="eg - The Boy Who Lived"
        {...fields.title.as('text')}
        disabled={submitting}
      />

      <Field.Description>
        The title will be prefixed with the chapter number. For example, "Chapter 1: The Boy Who
        Lived". Leave blank to just use "Chapter 1".
      </Field.Description>

      {#each fields.title.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <!-- Content -->
    <Field.Field>
      <Field.Label>Content*</Field.Label>

      <Editor bind:value={content} />

      <input {...fields.content.as('hidden', content)} />

      <Field.Description></Field.Description>

      {#each fields.content.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <!-- Completed -->
    <Field.Field orientation="horizontal">
      <Field.Content>
        <Field.Label for="completed">Story Completed</Field.Label>

        <Field.Description>
          Mark the story as completed. This is just for readers' convenience, you may still add more
          chapters.
        </Field.Description>
      </Field.Content>

      <Switch id="completed" name="completed" bind:checked={completed} disabled={submitting} />

      <input {...fields.completed.as('hidden', completed)} />
      {#each fields.completed.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>
  </Field.Group>

  <div class="flex justify-end gap-3 py-3">
    <Button type="submit" disabled={submitting}>
      {#if submitting}
        <CircleIcon class="mr-2 size-6 animate-ping" />
      {/if}
      Publish
    </Button>
  </div>
</form>
