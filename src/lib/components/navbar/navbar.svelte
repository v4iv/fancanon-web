<script lang="ts">
  import { PlusIcon, MenuIcon, SearchIcon, UserRoundIcon } from '@lucide/svelte'

  import { useSidebar } from '$lib/components/ui/sidebar'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Sheet from '$lib/components/ui/sheet'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { SearchInput } from '$lib/components/navbar'
  import { ThemeSwitcher } from '$lib/components/theme-switcher'
  import { Notifications } from '$lib/components/notifications'

  const sidebar = useSidebar()
</script>

<header
  class="fixed top-0 right-0 left-0 z-40 flex w-full items-center gap-2 border-b bg-background p-2"
>
  <!-- sidebar trigger -->
  <div class="hidden shrink-0 md:flex">
    <Button variant="ghost" size="icon-lg" onclick={() => sidebar.toggle()}>
      <MenuIcon class="size-5" />
      <span class="sr-only">sidebar toggle</span>
    </Button>
  </div>

  <!-- logo & app name -->
  <div class="flex shrink-0 items-center gap-1">
    <a href="/" class="p-2">
      <img src="/logo.svg" alt="fancanon logo that links to home" width={24} height={24} />
      <span class="sr-only">fancanon home</span>
    </a>

    <a href="/" class="hidden md:block">
      <span class="text-2xl font-thin tracking-wider">fancanon</span>
    </a>
  </div>

  <!-- search box -->
  <div class="hidden flex-1 justify-center md:flex">
    <div class="w-full max-w-sm">
      <SearchInput />
    </div>
  </div>

  <!-- create, theme switcher, notifications & profile  -->
  <nav class="ml-auto flex items-center gap-3 p-2">
    <div class="hidden items-center md:inline-flex">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', class: 'rounded-full' })}>
          <PlusIcon class="size-4" />
          Create
        </DropdownMenu.Trigger>

        <DropdownMenu.Content align="end" class="w-full">
          <DropdownMenu.Item>
            <PlusIcon />
            <a href="/" class="w-full">New Story</a>
          </DropdownMenu.Item>

          <DropdownMenu.Item class="cursor-pointer">
            <PlusIcon />
            <a href="/" class="w-full">Add Chapter</a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    <Sheet.Root>
      <Sheet.Trigger
        class={buttonVariants({
          variant: 'ghost',
          size: 'icon-lg',
          class: 'flex rounded-full md:hidden',
        })}
      >
        <SearchIcon class="size-5" />
        <span class="sr-only">Search</span>
      </Sheet.Trigger>

      <Sheet.Content side="top">
        <Sheet.Header />
        <div class="w-full p-4">
          <SearchInput />
        </div>
      </Sheet.Content>
    </Sheet.Root>

    <ThemeSwitcher />

    <Notifications />

    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class={buttonVariants({
          variant: 'outline',
          size: 'icon-lg',
          class: 'hidden rounded-full md:flex',
        })}
      >
        <UserRoundIcon class="size-5" />
        <span class="sr-only">user menu</span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end" class="w-full">
        <DropdownMenu.Item>
          <a href="/" class="w-full">Sign In</a>
        </DropdownMenu.Item>

        <DropdownMenu.Item class="cursor-pointer">
          <a href="/" class="w-full">Sign Up</a>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </nav>
</header>
