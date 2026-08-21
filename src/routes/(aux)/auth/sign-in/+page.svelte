<script lang="ts">
  import { page } from '$app/state'

  import { m } from '$lib/paraglide/messages.js'
  import logo from '$lib/assets/logo.svg'
  import uwu from '$lib/assets/kawaii/uwu-shadow.svg'
  import { Helmet } from '$lib/components/helmet'
  import * as Card from '$lib/components/ui/card'
  import * as Field from '$lib/components/ui/field'
  import { SignInForm } from '$lib/components/forms/sign-in-form'
  import { uwuState } from '$lib/hooks/uwu.svelte'

  const redirect = $derived(page.url?.searchParams?.get('redirect') || '/')
</script>

<Helmet title={m['sign-in-page.title']()} />

<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
  <div class="flex w-full max-w-sm flex-col gap-6">
    <a href="/" class="flex items-center gap-2 self-center">
      <div class="flex items-center justify-center gap-2 rounded-md">
        {#if uwuState.enabled}
          <img src={uwu} alt="logo" class="h-16 w-auto" />
        {:else}
          <img src={logo} alt="logo" height={24} width={24} />
          <span class="text-2xl font-thin tracking-wider text-accent-foreground">
            {m['app-name']()}
          </span>
        {/if}
      </div>
    </a>

    <div class="flex flex-col gap-6">
      <Card.Root>
        <Card.Header class="text-center">
          <Card.Title class="text-xl">{m['sign-in-page.heading']()}</Card.Title>

          <Card.Description>{m['sign-in-page.subheading']()}</Card.Description>
        </Card.Header>

        <Card.Content>
          <SignInForm {redirect} />
        </Card.Content>
      </Card.Root>

      <Field.Description class="px-6 text-center">
        {m['sign-in-page.consent-statement']()}
        <a href="/terms-and-conditions">{m['sign-in-page.terms-and-conditions']()} </a>
        and <a href="/privacy-policy">{m['sign-in-page.privacy-policy']()}</a>.
      </Field.Description>
    </div>
  </div>
</div>
