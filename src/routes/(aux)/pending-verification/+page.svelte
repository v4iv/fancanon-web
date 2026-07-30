<script lang="ts">
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'

  import { sendVerificationEmail } from '$lib/client'
  import { Helmet } from '$lib/components/helmet'
  import { Button } from '$lib/components/ui/button'
  import * as Card from '$lib/components/ui/card'
  // import ResendEmailConfirmationForm from '$lib/components/forms/resend-email-confirmation/resend-email-confirmation-form.svelte'

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
    } catch (error) {
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

<Helmet title="Pending Verification | fancanon" />

<main class="mx-auto flex min-h-screen w-full max-w-screen-sm items-center justify-center">
  <div class="w-full px-2">
    <Card.Root>
      <Card.Header class="flex flex-col items-center justify-center text-center">
        <a href="/" class="mb-2 flex items-center gap-2">
          <img src="/logo.svg" alt="fancanon" height={24} width={24} />
          <span class="text-2xl font-thin tracking-wider">fancanon</span>
        </a>

        <Card.Title class="text-2xl">Confirm Your Email</Card.Title>

        <Card.Description></Card.Description>
      </Card.Header>
      {#if email}
        <Card.Content class="text-center">
          <h2 class="text-3xl">
            Check your inbox to activate your account. We sent a verification link to {email}.
          </h2>
        </Card.Content>

        <Card.Footer class="flex-col text-sm">
          <div class="flex items-center justify-center">
            If you haven't recieved the email — <Button
              variant="link"
              onclick={handleResend}
              disabled={isDisabled}
            >
              {#if isSending}
                Sending...
              {:else}
                {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend Confirmation Email'}
              {/if}
            </Button>
          </div>
          <p>
            <a
              href="mailto:support@fancanon.com"
              class="text-primary hover:underline hover:underline-offset-4"
            >
              Contact Support
            </a>
          </p>
        </Card.Footer>
      {:else}
        <Card.Content>
          <!-- <ResendEmailConfirmationForm /> -->
        </Card.Content>
        <Card.Footer class="flex justify-center text-sm">
          Don't have an account?&nbsp;
          <a href={`/auth/sign-up`} class="text-sm underline underline-offset-4"> Sign up here. </a>
        </Card.Footer>
      {/if}
    </Card.Root>
  </div>
</main>
