<script lang="ts">
  import { goto } from '$app/navigation'
  import { isHttpError } from '@sveltejs/kit'
  import { toast } from 'svelte-sonner'
  import { captureException } from '@sentry/sveltekit'
  import { useQueryClient } from '@tanstack/svelte-query'
  import { CircleIcon } from '@lucide/svelte'

  import { signUp as form } from '$lib/remote/auth/data.remote'
  import { signIn } from '$lib/client'
  import { m } from '$lib/paraglide/messages.js'
  import { track } from '$lib/analytics'
  import * as Field from '$lib/components/ui/field'
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'
  import { Google } from '$lib/components/brand-icons'

  const { redirect } = $props()

  let { enhance, fields } = $derived(form)

  const client = useQueryClient()

  let submitting = $state(false)

  const signUpWithGoogle = async (callbackURL: string) => {
    track('login', { method: 'google' })

    client.invalidateQueries()

    await signIn.social({
      provider: 'google',
      callbackURL,
    })
  }
</script>

<form
  class="space-y-4"
  {...enhance(async ({ element, submit }: any) => {
    try {
      const res = await submit()

      if (res) {
        track('sign_up', {
          method: 'credential',
        })

        const email = element.email

        client.invalidateQueries()

        toast('Success!', { description: 'Account created successfully.' })

        goto(`/pending-verification?email=${email.value}`)

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
    <Field.Field>
      <Button variant="outline" class="w-full" onclick={() => signUpWithGoogle(redirect)}>
        <Google />
        {m['sign-up-page.sign-up-with-google']()}
      </Button>
    </Field.Field>

    <Field.FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">
      {m['sign-up-page.or']()}
    </Field.FieldSeparator>

    <Field.Field>
      <Field.Label for="name">{m['sign-up-page.name']()}*</Field.Label>

      <Input
        id="name"
        {...fields.name.as('text')}
        placeholder={m['sign-up-page.name-placeholder']()}
        disabled={submitting}
        required
      />

      <Field.Description></Field.Description>

      {#each fields.name.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Field.Label for="name">{m['sign-up-page.username']()}*</Field.Label>

      <Input
        id="username"
        {...fields.username.as('text')}
        placeholder={m['sign-up-page.username-placeholder']()}
        disabled={submitting}
        required
      />

      <Field.Description></Field.Description>

      {#each fields.username.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Field.Label for="email">{m['sign-up-page.email']()}*</Field.Label>

      <Input
        id="email"
        {...fields.email.as('email')}
        placeholder={m['sign-up-page.email-placeholder']()}
        disabled={submitting}
        required
      />

      <Field.Description></Field.Description>

      {#each fields.email.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Field.Field class="grid grid-cols-2 gap-4">
        <Field.Field>
          <Field.Label for="new-password">{m['sign-up-page.password']()}*</Field.Label>

          <Input
            id="new-password"
            {...fields._newPassword.as('password')}
            disabled={submitting}
            required
          />
        </Field.Field>

        <Field.Field>
          <Field.Label for="confirm-password">{m['sign-up-page.confirm-password']()}*</Field.Label>
          <Input
            id="confirm-password"
            {...fields._confirmPassword.as('password')}
            disabled={submitting}
            required
          />
        </Field.Field>
      </Field.Field>

      <Field.Description></Field.Description>

      {#each fields._newPassword.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}

      {#each fields._confirmPassword.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}

      <ul class="pl-4 text-sm text-muted-foreground">
        <li class="list-disc">{m['sign-up-page.password-directive-one']()}*</li>

        <li class="list-disc">{m['sign-up-page.password-directive-two']()}*</li>

        <li class="list-disc">{m['sign-up-page.password-directive-three']()}*</li>
      </ul>
    </Field.Field>

    <Field.Field>
      <Button type="submit">
        {#if submitting}
          <CircleIcon class="mr-2 size-6 animate-ping" />
        {/if}
        {m['sign-up-page.submit']()}
      </Button>

      <Field.Description class="text-center">
        {m['sign-up-page.account-exists']()}
        <a href="/auth/sign-in">{m['sign-up-page.sign-in']()}</a>
      </Field.Description>
    </Field.Field>
  </Field.Group>
</form>
