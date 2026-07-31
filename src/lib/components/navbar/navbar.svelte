<script lang="ts">
  import { goto } from '$app/navigation'
  import { useQueryClient } from '@tanstack/svelte-query'
  import {
    PlusIcon,
    MenuIcon,
    LogInIcon,
    LogOutIcon,
    SearchIcon,
    SettingsIcon,
    UserRoundIcon,
    UserRoundPlusIcon,
  } from '@lucide/svelte'

  import { signOut, useSession } from '$lib/client'
  import { m } from '$lib/paraglide/messages.js'
  import { useSidebar } from '$lib/components/ui/sidebar'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Sheet from '$lib/components/ui/sheet'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { SearchInput } from '$lib/components/navbar'
  import { ThemeSwitcher } from '$lib/components/theme-switcher'
  import { Notifications } from '$lib/components/notifications'

  const sidebar = useSidebar()
  const session = useSession()
  const client = useQueryClient()

  const handleSignOut = async () => {
    await signOut()

    client.invalidateQueries()

    goto(`/auth/sign-in`)
  }
</script>

<header
  class="fixed top-0 right-0 left-0 z-40 flex w-full items-center gap-2 border-b bg-background p-2"
>
  <!-- sidebar trigger -->
  <div class="hidden shrink-0 md:flex">
    <Button variant="ghost" size="icon-lg" onclick={() => sidebar.toggle()}>
      <MenuIcon class="size-5" />
      <span class="sr-only">{m['navbar.sidebar-toggle']()}</span>
    </Button>
  </div>

  <!-- logo & app name -->
  <div class="flex shrink-0 items-center gap-1">
    <a href="/" class="p-2">
      <img src="/logo.svg" alt="fancanon logo that links to home" width={24} height={24} />
      <span class="sr-only">{m['app-name']()}</span>
    </a>

    <a href="/" class="hidden md:block">
      <span class="text-2xl font-thin tracking-wider">{m['app-name']()}</span>
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
          {m['navbar.create']()}
        </DropdownMenu.Trigger>

        <DropdownMenu.Content align="end" class="w-full">
          <DropdownMenu.Item>
            <PlusIcon />
            <a href="/" class="w-full">{m['navbar.new-story']()}</a>
          </DropdownMenu.Item>

          <DropdownMenu.Item class="cursor-pointer">
            <PlusIcon />
            <a href="/" class="w-full">{m['navbar.add-chapter']()}</a>
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
        <span class="sr-only">{m['navbar.search-label']()}</span>
      </Sheet.Trigger>

      <Sheet.Content side="top">
        <Sheet.Header />
        <div class="w-full p-4">
          <SearchInput />
        </div>
      </Sheet.Content>
    </Sheet.Root>

    <ThemeSwitcher />
    {#if $session?.isPending}
      <Skeleton class="size-9 rounded-full" />
    {:else if $session.data}
      <Notifications />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger class="hidden rounded-full md:flex">
          <Avatar.Root class="size-9 border">
            <Avatar.Image src={$session.data.user?.image} alt={$session.data.user.name} />
            <Avatar.Fallback>{$session.data.user.name[0]}</Avatar.Fallback>

            <span class="sr-only">{m['navbar.user-menu']()}</span>
          </Avatar.Root>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content align="end" class="w-full">
          <DropdownMenu.Label>
            {m['navbar.hi']({ name: $session.data.user.name })}
          </DropdownMenu.Label>

          <DropdownMenu.Separator />

          <DropdownMenu.Item>
            <UserRoundIcon />
            <a href={`/user/${$session.data.user?.username}`} class="w-full">
              {m['navbar.profile']()}
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Item>
            <SettingsIcon />
            <a href="/settings" class="w-full">
              {m['navbar.settings']()}
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Item class="cursor-pointer" onclick={handleSignOut}>
            <LogOutIcon />
            {m['navbar.sign-out']()}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {:else}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class={buttonVariants({
            variant: 'outline',
            size: 'icon-lg',
            class: 'hidden rounded-full md:flex',
          })}
        >
          <UserRoundIcon class="size-5" />
          <span class="sr-only">{m['navbar.user-menu']()}</span>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content align="end" class="w-full">
          <DropdownMenu.Item>
            <LogInIcon />
            <a href="/auth/sign-in" class="w-full">{m['navbar.sign-in']()}</a>
          </DropdownMenu.Item>

          <DropdownMenu.Item class="cursor-pointer">
            <UserRoundPlusIcon />
            <a href="/auth/sign-up" class="w-full">{m['navbar.sign-up']()}</a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}
  </nav>
</header>
