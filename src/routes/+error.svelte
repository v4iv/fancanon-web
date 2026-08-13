<script lang="ts">
  import { page } from '$app/state'
  import { ORIGIN } from '$app/env/public'

  import { m } from '$lib/paraglide/messages.js'
  import { Separator } from '$lib/components/ui/separator'
  import { Footer } from '$lib/components/footer'

  const Teapot = (await import('$lib/assets/kawaii/418-Teapot.png?format=avif')).default
  const NotFound = (await import('$lib/assets/kawaii/404-NotFound.png?format=avif')).default
  const Forbidden = (await import('$lib/assets/kawaii/403-Forbidden.png?format=avif')).default
  const ServiceUnavailable = (
    await import('$lib/assets/kawaii/503-ServiceUnavailable.png?format=avif')
  ).default
  const InternalServerError = (
    await import('$lib/assets/kawaii/500-InternalServerError.png?format=avif')
  ).default
</script>

<svelte:head>
  <title>Error {page.status} | fancanon</title>
  <meta name="description" content="The Ultimate Fanfiction Platform" />
</svelte:head>

<header class="flex w-full items-center justify-center border-b p-4">
  <a href={`${ORIGIN}`} class="flex shrink-0 items-center gap-2">
    <img src="/logo.svg" alt="fancanon logo that links to home" width={24} height={24} />
    <span class="text-2xl font-thin tracking-wider">{m['app-name']()}</span>
  </a>
</header>

<main class="mx-auto flex min-h-screen w-full max-w-screen-lg items-center justify-center">
  {#if page.status === 403}
    <div
      class="relative max-w-screen-md after:absolute after:inset-0 after:bg-primary after:mix-blend-soft-light"
    >
      <enhanced:img
        src={Forbidden}
        alt={page.error?.message}
        fetchpriority="high"
        sizes="min(1280px, 100vw)"
        class="grayscale"
      />
    </div>
  {:else if page.status === 404}
    <div
      class="relative max-w-screen-md after:absolute after:inset-0 after:bg-primary after:mix-blend-soft-light"
    >
      <enhanced:img
        src={NotFound}
        alt={page.error?.message}
        fetchpriority="high"
        sizes="min(1280px, 100vw)"
        class="grayscale"
      />
    </div>
  {:else if page.status === 418}
    <div
      class="relative max-w-screen-md after:absolute after:inset-0 after:bg-primary after:mix-blend-soft-light"
    >
      <enhanced:img
        src={Teapot}
        alt={page.error?.message}
        fetchpriority="high"
        sizes="min(1280px, 100vw)"
        class="grayscale"
      />
    </div>
  {:else if page.status === 500}
    <div
      class="relative max-w-screen-md after:absolute after:inset-0 after:bg-primary after:mix-blend-soft-light"
    >
      <enhanced:img
        src={InternalServerError}
        alt={page.error?.message}
        fetchpriority="high"
        sizes="min(1280px, 100vw)"
        class="grayscale"
      />
    </div>
  {:else if page.status === 503}
    <div
      class="relative max-w-screen-md after:absolute after:inset-0 after:bg-primary after:mix-blend-soft-light"
    >
      <enhanced:img
        src={ServiceUnavailable}
        alt={page.error?.message}
        fetchpriority="high"
        sizes="min(1280px, 100vw)"
        class="grayscale"
      />
    </div>
  {:else}
    <div class="flex h-8 items-center space-x-4">
      <h1 class="text-2xl text-primary">{page.status}</h1>

      <Separator orientation="vertical" />

      <p class="text-lg">{page?.error?.message}</p>
    </div>
  {/if}
</main>

<Footer />
