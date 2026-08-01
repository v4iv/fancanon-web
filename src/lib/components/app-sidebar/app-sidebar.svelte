<script lang="ts">
  import { browser } from '$app/env'
  import type { ComponentProps } from 'svelte'
  import {
    BookmarkIcon,
    ChevronRightIcon,
    ClockIcon,
    CrownIcon,
    HouseIcon,
    NewspaperIcon,
    OrbitIcon,
  } from '@lucide/svelte'

  import { m } from '$lib/paraglide/messages.js'
  import { CATEGORIES, LINKS } from '$lib/constants'
  import { useMedia } from '$lib/hooks/use-media.svelte'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import * as Collapsible from '$lib/components/ui/collapsible'

  let {
    ref = $bindable(null),
    collapsible = 'icon',
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> = $props()

  let open = $state(true)

  const media = useMedia()
  const sidebar = Sidebar.useSidebar()

  if (browser) {
    sidebar.setOpen(media['lg'] || media['xl'] || media['2xl'])
  }
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent={m['sidebar.home']()}>
            {#snippet child({ props })}
              <a href="/" {...props}>
                <HouseIcon class="size-5" />
                <span>{m['sidebar.home']()}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>

        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent={m['sidebar.feed']()}>
            {#snippet child({ props })}
              <a href="/" {...props}>
                <NewspaperIcon class="size-5" />
                <span>{m['sidebar.feed']()}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>

        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent={m['sidebar.crossovers']()}>
            {#snippet child({ props })}
              <a href="/" {...props}>
                <OrbitIcon class="size-5" />
                <span>{m['sidebar.crossovers']()}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>

        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent={m['sidebar.bookmarks']()}>
            {#snippet child({ props })}
              <a href="/" {...props}>
                <BookmarkIcon class="size-5" />
                <span>{m['sidebar.bookmarks']()}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>

        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent={m['sidebar.reading-lists']()}>
            {#snippet child({ props })}
              <a href="/" {...props}>
                <ClockIcon class="size-5" />
                <span>{m['sidebar.reading-lists']()}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>

        <Collapsible.Root bind:open class="group/collapsible">
          {#snippet child({ props })}
            <Sidebar.MenuItem {...props}>
              <Collapsible.Trigger>
                {#snippet child({ props })}
                  <Sidebar.MenuButton {...props} tooltipContent={m['sidebar.categories']()}>
                    <CrownIcon />
                    <span>{m['sidebar.categories']()}</span>
                    <ChevronRightIcon
                      class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    />
                  </Sidebar.MenuButton>
                {/snippet}
              </Collapsible.Trigger>

              <Collapsible.Content>
                <Sidebar.MenuSub>
                  {#each CATEGORIES as category, idx (idx)}
                    {@const key = `categories.${category.slug}`}
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton>
                        {#snippet child({ props })}
                          <a href={`/categories/${category.slug}`} {...props}>
                            <span>{m[key]()}</span>
                          </a>
                        {/snippet}
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  {/each}
                </Sidebar.MenuSub>
              </Collapsible.Content>
            </Sidebar.MenuItem>
          {/snippet}
        </Collapsible.Root>
      </Sidebar.Menu>
    </Sidebar.Group>
    <Sidebar.Group />
  </Sidebar.Content>

  <Sidebar.Footer class="space-y-2 border-t py-4 group-data-[collapsible=icon]:hidden">
    <div class="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
      {#each LINKS as link}
        {@const key = `footer.${link.href}`}
        <a href={`/${link.href}`} class="block text-foreground duration-150 hover:text-primary">
          <span>{m[key]()}</span>
        </a>
      {/each}
    </div>

    <div class="space-y-2">
      <p class="block text-center font-mono text-xs font-extralight text-muted-foreground">
        {m['footer.copyright']({ year: new Date().getFullYear() })}
      </p>
    </div>
  </Sidebar.Footer>
</Sidebar.Root>
