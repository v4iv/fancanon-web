<script lang="ts">
  import { page } from '$app/state'
  import { m } from '$lib/paraglide/messages.js'
  import { Helmet } from '$lib/components/helmet'
  import * as Card from '$lib/components/ui/card'
  import { ResetPasswordForm } from '$lib/components/forms/reset-password-form'

  const token = page.url?.searchParams?.get('token') as string
</script>

<Helmet title={m['reset-password-page.title']()} />

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
          <Card.Title class="text-xl">{m['reset-password-page.heading']()}</Card.Title>

          <Card.Description>{m['reset-password-page.subheading']()}</Card.Description>
        </Card.Header>

        <Card.Content>
          <ResetPasswordForm {token} />
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</div>
