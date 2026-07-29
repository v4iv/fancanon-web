<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import {
    BookmarkIcon,
    ChevronRightIcon,
    ClockIcon,
    CrownIcon,
    HouseIcon,
    NewspaperIcon,
  } from '@lucide/svelte'

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

  sidebar.setOpen(media['lg'] || media['xl'] || media['2xl'])
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent="Home">
            {#snippet child({ props })}
              <a href="/" {...props}>
                <HouseIcon class="size-5" />
                <span>Home</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>

        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent="Feed">
            {#snippet child({ props })}
              <a href="/" {...props}>
                <NewspaperIcon class="size-5" />
                <span>Feed</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>

        <Collapsible.Root bind:open class="group/collapsible">
          {#snippet child({ props })}
            <Sidebar.MenuItem {...props}>
              <Collapsible.Trigger>
                {#snippet child({ props })}
                  <Sidebar.MenuButton {...props} tooltipContent="Categories">
                    <CrownIcon />
                    <span>Categories</span>
                    <ChevronRightIcon
                      class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    />
                  </Sidebar.MenuButton>
                {/snippet}
              </Collapsible.Trigger>

              <Collapsible.Content>
                <Sidebar.MenuSub>
                  {#each CATEGORIES as category, idx (idx)}
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton>
                        {#snippet child({ props })}
                          <a href={`/categories/${category.slug}`} {...props}>
                            <span>{category.name}</span>
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

        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent="Bookmarks">
            {#snippet child({ props })}
              <a href="/" {...props}>
                <BookmarkIcon class="size-5" />
                <span>Bookmarks</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>

        <Sidebar.MenuItem>
          <Sidebar.MenuButton tooltipContent="Reading List">
            {#snippet child({ props })}
              <a href="/" {...props}>
                <ClockIcon class="size-5" />
                <span>Reading List</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Group>
    <Sidebar.Group />
  </Sidebar.Content>

  <Sidebar.Footer class="space-y-2 border-t py-4 group-data-[collapsible=icon]:hidden">
    <div class="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
      {#each LINKS as link}
        <a href={link.href} class="block text-muted-foreground duration-150 hover:text-primary">
          <span>{link.label}</span>
        </a>
      {/each}
    </div>

    <div class="space-y-2">
      <p class="block text-center font-mono text-xs font-extralight text-muted-foreground">
        &copy; {new Date().getFullYear()} fancanon
      </p>
    </div>
  </Sidebar.Footer>
</Sidebar.Root>
