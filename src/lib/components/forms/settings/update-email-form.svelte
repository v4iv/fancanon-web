<script lang="ts">
  import { isHttpError } from '@sveltejs/kit'
  import { toast } from 'svelte-sonner'
  import { captureException } from '@sentry/sveltekit'
  import { useQueryClient } from '@tanstack/svelte-query'
  import { CircleIcon, PencilIcon } from '@lucide/svelte'

  import { updateEmail as form } from '$lib/remote/user/data.remote'
  import { track } from '$lib/analytics'
  import * as Field from '$lib/components/ui/field'
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'

  interface Props {
    currentValue: string
  }

  let { currentValue }: Props = $props()

  let { enhance, fields } = $derived(form)

  const client = useQueryClient()

  let submitting = $state(false)

  let mode = $state<'edit' | 'view'>('view')

  let submitDisabled = $derived.by(
    () =>
      submitting ||
      mode === 'view' ||
      currentValue === fields.newEmail.value() ||
      fields.newEmail.value() === undefined,
  )
</script>

<form
  class="space-y-4"
  {...enhance(async ({ element, submit }: any) => {
    try {
      const res = await submit()

      if (res) {
        track('change_email')

        mode = 'view'

        client.invalidateQueries()

        toast('Check Your Inbox', {
          description: 'We have sent you a verification link at your new email',
        })

        element.reset()
      }
    } catch (err) {
      captureException(err)

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
    <Field.Field class="grow">
      <Field.Label for="name" class="text-lg">Email</Field.Label>

      <div class="flex w-full items-end gap-2">
        <Input
          id="email"
          {...fields.newEmail.as('email', currentValue)}
          disabled={submitting || mode === 'view'}
          required
        />

        {#if mode === 'edit'}
          <Button variant="default" type="submit" disabled={submitDisabled}>
            {#if submitting}
              <CircleIcon class="size-6 animate-ping" />
            {/if}
            Save
          </Button>

          <Button
            type="button"
            variant="outline"
            onclick={(e) => {
              e.preventDefault()
              fields.newEmail.set(currentValue)
              mode = 'view'
            }}
          >
            Cancel
          </Button>
        {:else}
          <Button
            type="button"
            variant="outline"
            onclick={(e) => {
              e.preventDefault()
              mode = 'edit'
            }}
          >
            <PencilIcon class="size-4" />
            <span> Edit </span>
          </Button>
        {/if}
      </div>

      <Field.Description>Changing email will require verification.</Field.Description>

      {#each fields.newEmail.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>
  </Field.Group>
</form>
