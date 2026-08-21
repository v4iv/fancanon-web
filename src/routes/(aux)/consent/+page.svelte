<script lang="ts">
  import { page } from '$app/state'

  import { m } from '$lib/paraglide/messages.js'
  import logo from '$lib/assets/logo.svg'
  import uwu from '$lib/assets/kawaii/uwu-shadow.svg'
  import { Helmet } from '$lib/components/helmet'
  import * as Card from '$lib/components/ui/card'
  import { ContentConsentForm } from '$lib/components/forms/consent-form'
  import { uwuState } from '$lib/hooks/uwu.svelte'

  const searchParams = $derived(page.url.searchParams)
  const redirect = $derived(searchParams.get('redirect') ?? '/') as string
</script>

<Helmet title="Consent for Explicit Content  | fancanon" />

<Helmet title={m['pending-verification-page.title']()} />

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
        <Card.Header class="flex flex-col items-center justify-center text-center">
          <Card.Title class="font-heading text-2xl">Explicit Content</Card.Title>

          <Card.Description
            >Some stories on Fancanon are marked as Explicit and may contain material intended only
            for mature audiences.</Card.Description
          >
        </Card.Header>

        <Card.Content class="space-y-5">
          <p>
            This content is created and uploaded by members of the community and may include themes
          </p>

          <ul class="list-disc px-3">
            <li>Explicit sexual content</li>
            <li>Graphic violence or gore</li>
            <li>Strong language</li>
            <li>Sensitive or disturbing topics</li>
          </ul>

          <p>By continuing, you confirm that:</p>

          <ul class="list-disc px-3">
            <li>You understand you are about to view content intended for mature audiences.</li>
            <li>You are choosing to view this content voluntarily.</li>
            <li>You are legally permitted to access this type of content where you live.</li>
            <li>
              You understand that individual stories may contain additional content warnings
              provided by their authors.
            </li>
          </ul>

          <p class="font-semibold">Please read each story's tags and warnings before continuing.</p>
        </Card.Content>

        <Card.Footer class="w-full px-15">
          <ContentConsentForm {redirect} />
        </Card.Footer>
      </Card.Root>
    </div>
  </div>
</div>
