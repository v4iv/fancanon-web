<script lang="ts">
  import { goto } from '$app/navigation'
  import { isHttpError } from '@sveltejs/kit'
  import { toast } from 'svelte-sonner'
  import { CircleAlertIcon, CircleIcon } from '@lucide/svelte'

  import { signIn as form } from '$lib/remote/auth/data.remote'
  import { signIn } from '$lib/client'
  import { m } from '$lib/paraglide/messages.js'
  import * as Alert from '$lib/components/ui/alert'
  import * as Field from '$lib/components/ui/field'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'

  const { redirect } = $props()

  let { enhance, fields } = $derived(form)

  let submitting = $state(false)
  let emailNotVerified = $state(false)

  const signInWithGoogle = async () => {
    signIn.social({
      provider: 'google',
      callbackURL: redirect,
    })
  }
</script>

<form
  class="space-y-4"
  {...enhance(async ({ element, submit }: any) => {
    try {
      submitting = true

      const res = await submit()

      if (res) {
        element.reset()
        toast.success('Success!', { description: 'Logged in successfully.' })
        goto(redirect)
      }
    } catch (err) {
      console.error(err)

      if (isHttpError(err)) {
        if (err.body.message === 'Email not verified') {
          emailNotVerified = true
        }

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
      <Button variant="outline" class="w-full" onclick={signInWithGoogle}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        {m['sign-in-page.sign-in-with-google']()}
      </Button>
    </Field.Field>

    <Field.FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">
      {m['sign-in-page.or']()}
    </Field.FieldSeparator>

    {#if emailNotVerified}
      <Alert.Root variant="destructive">
        <CircleAlertIcon />
        <Alert.Title>{m['sign-in-page.email-unverified']()}</Alert.Title>
        <Alert.Description>
          <p>
            {m['sign-in-page.verification-mail-indication']()}
          </p>
        </Alert.Description>
      </Alert.Root>
    {/if}

    <Field.Field>
      <Field.Label for="email">{m['sign-in-page.email']()}*</Field.Label>

      <Input
        id="email"
        {...fields.email.as('email')}
        placeholder={m['sign-in-page.email-placeholder']()}
        disabled={submitting}
        required
      />

      <Field.Description></Field.Description>

      {#each fields.email.issues() as issue}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <div class="flex items-center">
        <Field.Label for="password">{m['sign-in-page.password']()}*</Field.Label>
        <a
          href="/auth/forgot-password"
          class="ml-auto inline-block text-sm underline underline-offset-4"
        >
          {m['sign-in-page.forgot-password']()}
        </a>
      </div>

      <Input id="password" {...fields._password.as('password')} disabled={submitting} required />

      <Field.Description></Field.Description>

      {#each fields._password.issues() as issue}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Button type="submit">
        {#if submitting}
          <CircleIcon class="mr-2 size-6 animate-ping" />
        {/if}
        {m['sign-in-page.submit']()}
      </Button>

      <Field.Description class="text-center">
        {m['sign-in-page.no-account']()}
        <a href="/auth/sign-up">{m['sign-in-page.sign-up']()}</a>
      </Field.Description>
    </Field.Field>
  </Field.Group>
</form>
