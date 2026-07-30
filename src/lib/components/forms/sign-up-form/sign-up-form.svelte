<script lang="ts">
  import { goto } from '$app/navigation'
  import { isHttpError } from '@sveltejs/kit'
  import { toast } from 'svelte-sonner'
  import { captureException } from '@sentry/sveltekit'
  import { CircleIcon } from '@lucide/svelte'

  import { signUp as form } from '$lib/remote/auth/data.remote'
  import { signIn } from '$lib/client'
  import { m } from '$lib/paraglide/messages.js'
  import * as Field from '$lib/components/ui/field'
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'

  let { enhance, fields } = $derived(form)

  let submitting = $state(false)

  const signUpWithGoogle = async () => {
    signIn.social({
      provider: 'google',
      callbackURL: '/',
    })
  }
</script>

<form
  class="space-y-4"
  {...enhance(async ({ element, submit }: any) => {
    try {
      const res = await submit()

      if (res) {
        // const email = element.email
        // goto(`/pending-verification?email=${email.value}`)
        element.reset()
        toast('Success!', { description: 'Account created successfully.' })
        goto('/')
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
      <Button variant="outline" class="w-full" onclick={signUpWithGoogle}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
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

      {#each fields.name.issues() as issue}
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

      {#each fields.username.issues() as issue}
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

      {#each fields.email.issues() as issue}
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

      {#each fields._newPassword.issues() as issue}
        <Field.Error>{issue.message}</Field.Error>
      {/each}

      {#each fields._confirmPassword.issues() as issue}
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
