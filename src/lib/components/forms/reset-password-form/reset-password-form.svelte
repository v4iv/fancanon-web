<script lang="ts">
  import { goto } from '$app/navigation'
  import { toast } from 'svelte-sonner'
  import { CircleIcon } from '@lucide/svelte'
  import { isHttpError } from '@sveltejs/kit'
  import * as Sentry from '@sentry/sveltekit'

  import { resetPassword as form } from '$lib/remote/auth/data.remote'
  import * as Field from '$lib/components/ui/field'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'

  interface Props {
    token?: string
  }

  const { token = '' }: Props = $props()

  let { enhance, fields } = $derived(form)

  let submitting = $state(false)
</script>

<form
  class="space-y-4"
  {...enhance(async ({ element, submit }: any) => {
    try {
      submitting = true

      const res = await submit()

      if (res) {
        element.reset()

        toast.success('Success!', { description: 'Password reset successfully.' })

        goto('/', {})
      }
    } catch (err) {
      Sentry.captureException(err)

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
    <Field.Field>
      <Input hidden id="token" {...fields._token.as('text', token)} disabled={submitting} />

      <Field.Description></Field.Description>
    </Field.Field>

    <Field.Field>
      <Field.Label for="newPassword">New Password*</Field.Label>

      <Input id="newPassword" {...fields._newPassword.as('password')} required />

      <Field.Description></Field.Description>

      {#each fields._newPassword.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Field.Label for="confirmPassword">Confirm Password*</Field.Label>

      <Input
        id="confirmPassword"
        {...fields._confirmPassword.as('password')}
        disabled={submitting}
        required
      />

      <Field.Description></Field.Description>

      {#each fields._confirmPassword.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Button type="submit" class="w-full" disabled={submitting}>
        {#if submitting}
          <CircleIcon class="mr-2 size-6 animate-ping" />
        {/if}
        Submit
      </Button>
    </Field.Field>
  </Field.Group>
</form>
