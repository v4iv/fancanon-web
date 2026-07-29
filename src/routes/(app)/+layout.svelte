<script lang="ts">
  import type { LayoutProps } from './$types'

  import { useMedia } from '$lib/hooks/use-media.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { Navbar, NavbarBottom } from '$lib/components/navbar'
  import { AppSidebar } from '$lib/components/app-sidebar'

  const { children }: LayoutProps = $props()

  const media = useMedia()
</script>

<Sidebar.Provider>
  {#if media['md'] || media['lg'] || media['xl'] || media['2xl']}
    <AppSidebar class="h-full pt-16" />
  {/if}

  <Sidebar.Inset>
    <Navbar />

    <main class="my-16 flex flex-1 flex-col gap-4 overflow-y-scroll p-4">
      {@render children()}
    </main>

    <NavbarBottom />
  </Sidebar.Inset>
</Sidebar.Provider>
