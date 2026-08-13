<script lang="ts">
  import type { LayoutProps } from './$types'
  import { replaceState, afterNavigate } from '$app/navigation'
  import { browser, building } from '$app/env'
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'

  import { useSession } from '$lib/client'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { AppSidebar } from '$lib/components/app-sidebar'
  import { Navbar, NavbarBottom } from '$lib/components/navbar'
  import { Footer } from '$lib/components/footer'

  const { children }: LayoutProps = $props()

  const session = useSession()

  let query = $derived.by(() => (!building ? page.url.searchParams.get('q') : ''))

  $effect(() => {
    if (page.url.searchParams.get('emailVerified') === 'true') {
      toast.success('Email Verified :)')

      // strip the param so a refresh (or any later navigation that
      // happens to share this URL) doesn't re-show the toast
      const url = new URL(page.url)
      url.searchParams.delete('emailVerified')
      replaceState(url, {})
    }
  })

  let scrollContainer: HTMLDivElement

  afterNavigate(({ type }) => {
    // Don't reset when using browser back/forward
    if (type !== 'popstate') {
      scrollContainer?.scrollTo({
        top: 0,

        behavior: 'instant',
      })
    }
  })

  const redirect = $derived.by(() => {
    let redirectPath = !building ? page.url?.searchParams?.get('redirect') : undefined

    if (redirectPath) {
      return redirectPath
    } else if (browser) {
      return window.location.pathname
    }

    return '/'
  })
</script>

<Sidebar.Provider>
  <div class="hidden md:block">
    <AppSidebar {session} class="h-full pt-16" />
  </div>

  <Sidebar.Inset class="h-svh min-w-0">
    <Navbar {session} {redirect} {query} />

    <div bind:this={scrollContainer} class="flex-1 overflow-y-scroll py-17">
      {@render children()}

      <div class="block md:hidden">
        <Footer />
      </div>
    </div>

    <NavbarBottom {session} {redirect} />
  </Sidebar.Inset>
</Sidebar.Provider>
