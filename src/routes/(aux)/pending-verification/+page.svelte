<script lang="ts">
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'
  import { captureException } from '@sentry/sveltekit'

  import { m } from '$lib/paraglide/messages.js'
  import { sendVerificationEmail } from '$lib/client'
  import { Helmet } from '$lib/components/helmet'
  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  import * as Field from '$lib/components/ui/field'

  const searchParams = $derived(page.url.searchParams)
  const email = $derived(searchParams.get('email'))

  let countdown = $state(0)
  let isSending = $state(false)
  let timerInterval: any = null

  const isDisabled = $derived(countdown > 0 || isSending)

  function startTimer() {
    countdown = 60

    if (timerInterval) clearInterval(timerInterval)

    timerInterval = setInterval(() => {
      if (countdown > 1) {
        countdown -= 1
      } else {
        clearInterval(timerInterval)
        countdown = 0
      }
    }, 1000)
  }

  async function handleResend() {
    if (isDisabled) return

    isSending = true

    try {
      if (email)
        await sendVerificationEmail({
          email,
          callbackURL: '/?emailVerified=true', // The redirect URL after verification
        })

      startTimer()
    } catch (err) {
      captureException(err)
      toast.error('Error! Something Went Wrong!', { description: 'Please try again!' })
    } finally {
      isSending = false
    }
  }

  $effect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  })
</script>

<Helmet title={m['pending-verification-page.title']()} />

<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
  <div class="flex w-full max-w-sm flex-col gap-6">
    <a href="/" class="flex items-center gap-2 self-center text-2xl font-thin tracking-wider">
      <div class="flex size-6 items-center justify-center rounded-md text-primary-foreground">
        <img src="/logo.svg" alt="logo" />
      </div>
      <span class="text-2xl font-thin tracking-wider">{m['app-name']()}</span>
    </a>

    <div class="flex flex-col gap-6">
      <Card.Root>
        <Card.Header class="flex flex-col items-center justify-center text-center">
          <Card.Title class="text-2xl"
            >{m['pending-verification-page.confirm-your-email']()}</Card.Title
          >

          <Card.Description></Card.Description>
        </Card.Header>
        {#if email}
          <Card.Content class="text-center wrap-break-word">
            <h2 class="text-xl">
              {m['pending-verification-page.check-inbox']({ email })}
            </h2>
          </Card.Content>

          <Card.Footer class="flex-col text-sm">
            <div class="flex flex-wrap items-center justify-center">
              {m['pending-verification-page.did-not-recieve']()}
              <Button variant="link" onclick={handleResend} disabled={isDisabled}>
                {#if isSending}
                  {m['pending-verification-page.sending']()}
                {:else}
                  {countdown > 0
                    ? m['pending-verification-page.resend-timer']({ countdown })
                    : m['pending-verification-page.resend-button']()}
                {/if}
              </Button>
            </div>
            <p>
              <a
                href="mailto:support@fancanon.com"
                class="text-primary hover:underline hover:underline-offset-4"
              >
                {m['pending-verification-page.contact-support']()}
              </a>
            </p>
          </Card.Footer>
        {/if}
      </Card.Root>

      <Field.Description class="px-6 text-center">
        {m['pending-verification-page.no-account']()}&nbsp;
        <a href="/auth/sign-up" class="text-sm underline underline-offset-4"
          >{m['pending-verification-page.sign-up']()}</a
        >
      </Field.Description>
    </div>
  </div>
</div>
