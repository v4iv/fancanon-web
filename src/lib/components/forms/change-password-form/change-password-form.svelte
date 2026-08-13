<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { CircleIcon } from '@lucide/svelte'
  import { isHttpError } from '@sveltejs/kit'
  import * as Sentry from '@sentry/sveltekit'

  import { changePassword } from '$lib/remote/auth/data.remote'
  import * as Field from '$lib/components/ui/field'
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'

  const { enhance, fields } = changePassword

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
        submitting = false
        toast.success('Success!', { description: 'Password changed successfully.' })
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
      <Field.Label for="currentPassword">Current Password*</Field.Label>

      <Input
        id="currentPassword"
        {...fields._currentPassword.as('password')}
        disabled={submitting}
        required
      />

      <Field.Description></Field.Description>

      {#each fields._newPassword.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Field.Label for="newPassword">New Password*</Field.Label>

      <Input
        id="newPassword"
        {...fields._newPassword.as('password')}
        disabled={submitting}
        required
      />

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
      <div class="flex w-full items-center justify-end">
        <Button type="submit" size="sm" disabled={submitting}>
          {#if submitting}
            <CircleIcon class="mr-2 size-6 animate-ping" />
          {/if}
          Submit
        </Button>
      </div>
    </Field.Field>
  </Field.Group>
</form>
