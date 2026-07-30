<script lang="ts">
  import { m } from '$lib/paraglide/messages.js'
  import { Helmet } from '$lib/components/helmet'
  import * as Card from '$lib/components/ui/card'
  import * as Field from '$lib/components/ui/field'
  import { SignUpForm } from '$lib/components/forms/sign-up-form'
</script>

<Helmet title={m['sign-up-page.title']()} />

<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
  <div class="flex w-full max-w-sm flex-col gap-6">
    <a href="/" class="flex items-center gap-2 self-center text-2xl font-thin tracking-wider">
      <div class="flex size-6 items-center justify-center rounded-md text-primary-foreground">
        <img src="/logo.svg" alt="logo" />
      </div>
      fancanon
    </a>

    <div class="flex flex-col gap-6">
      <Card.Root>
        <Card.Header class="text-center">
          <Card.Title class="text-xl">{m['sign-up-page.heading']()}</Card.Title>

          <Card.Description>{m['sign-up-page.subheading']()}</Card.Description>
        </Card.Header>

        <Card.Content>
          <SignUpForm />
        </Card.Content>
      </Card.Root>

      <Field.Description class="px-6 text-center">
        {m['sign-up-page.consent-statement']()}
        <a href="/terms-and-conditions">{m['sign-up-page.terms-and-conditions']()} </a>
        and <a href="/privacy-policy">{m['sign-up-page.privacy-policy']()}</a>.
      </Field.Description>
    </div>
  </div>
</div>
