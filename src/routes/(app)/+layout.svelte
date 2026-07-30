<script lang="ts">
  import type { LayoutProps } from './$types'
  import { onMount, tick } from 'svelte'
  import { page } from '$app/state'
  import { toast } from 'svelte-sonner'

  import * as Sidebar from '$lib/components/ui/sidebar'
  import { Navbar, NavbarBottom } from '$lib/components/navbar'
  import { AppSidebar } from '$lib/components/app-sidebar'

  const { children }: LayoutProps = $props()

  const searchParams = $derived(page.url.searchParams)

  let emailVerified = $derived(searchParams.get('emailVerified'))

  onMount(() => {
    tick().then(() => {
      if (emailVerified === 'true') {
        toast.success('Email Verified :)')
      }
    })
  })
</script>

<Sidebar.Provider>
  <div class="hidden md:block">
    <AppSidebar class="h-full pt-16" />
  </div>

  <Sidebar.Inset>
    <Navbar />

    <main class="my-16 flex flex-1 flex-col gap-4 overflow-y-scroll">
      {@render children()}
    </main>

    <NavbarBottom />
  </Sidebar.Inset>
</Sidebar.Provider>
