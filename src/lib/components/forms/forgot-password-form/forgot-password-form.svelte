<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { isHttpError } from '@sveltejs/kit'
  import * as Sentry from '@sentry/sveltekit'
  import { CircleIcon } from '@lucide/svelte'

  import { forgotPassword as form } from '$lib/remote/auth/data.remote'
  import { track } from '$lib/analytics'
  import { m } from '$lib/paraglide/messages.js'
  import * as Field from '$lib/components/ui/field'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'

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
        track('forgot_password')
        element.reset()
        toast('Check your email for instructions.', {
          description: 'If you have an account with us, you will get instructions in your email.',
        })
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
      <Field.Label for="email">Email*</Field.Label>

      <Input id="email" {...fields.email.as('email')} disabled={submitting} required />

      <Field.Description></Field.Description>

      {#each fields.email.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Button type="submit">
        {#if submitting}
          <CircleIcon class="mr-2 size-6 animate-ping" />
        {/if}
        Submit
      </Button>

      <Field.Description class="text-center">
        {m['forgot-password-page.no-account']()}
        <a href="/auth/sign-up">{m['forgot-password-page.sign-up']()}</a>
      </Field.Description>
    </Field.Field>
  </Field.Group>
</form>
