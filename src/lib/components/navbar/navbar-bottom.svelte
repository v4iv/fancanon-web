<script lang="ts">
  import { goto } from '$app/navigation'
  import { useQueryClient } from '@tanstack/svelte-query'
  import {
    PlusIcon,
    UserRoundIcon,
    ChevronRightIcon,
    // OrbitIcon,
    BookmarkIcon,
    SettingsIcon,
    LogOutIcon,
    CompassIcon,
    LibraryBigIcon,
    CrownIcon,
    CirclePlusIcon,
    CastleIcon,
    RotateCcwClockIcon,
    HouseIcon,
    NewspaperIcon,
  } from '@lucide/svelte'

  import { track } from '$lib/analytics'
  import { CATEGORIES } from '$lib/constants'
  import { m } from '$lib/paraglide/messages.js'
  import { signIn, signOut } from '$lib/client'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Item from '$lib/components/ui/item'
  import * as Sheet from '$lib/components/ui/sheet'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { Google } from '$lib/components/brand-icons'

  interface Props {
    redirect: string
    session: any
  }

  let { redirect, session }: Props = $props()

  // let open = $state(true)
  const client = useQueryClient()

  let userSheetOpen = $state(false)
  let createSheetOpen = $state(false)
  let categoriesSheetOpen = $state(false)

  const handleSignOut = async () => {
    await signOut()
    client.invalidateQueries()
    userSheetOpen = !userSheetOpen

    goto(`/auth/sign-in`)
  }

  const continueWithGoogle = async (callbackURL: string) => {
    track('login', { method: 'google' })

    client.invalidateQueries()

    await signIn.social({
      provider: 'google',
      callbackURL,
    })
  }
</script>

<footer
  class="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t bg-background/40 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden"
>
  <div class="mx-auto grid h-16 max-w-lg grid-cols-5">
    <a href="/" class="group inline-flex flex-col items-center justify-center px-5">
      <HouseIcon class="size-6.5" />
      <span class="sr-only">{m['navbar.home']()}</span>
    </a>

    <Sheet.Root bind:open={categoriesSheetOpen}>
      <Sheet.Trigger
        class="group inline-flex flex-col items-center justify-center rounded-s-full px-5"
      >
        <CompassIcon class="size-7" />
        <span class="sr-only">{m['navbar.explore']()}</span>
      </Sheet.Trigger>

      <Sheet.Content class="z-50 rounded-t-xl" side="bottom" showCloseButton={true}>
        <Sheet.Header class="flex-row items-center gap-2">
          <CompassIcon class="size-5" />
          <Sheet.Title>{m['navbar.explore']()}</Sheet.Title>
        </Sheet.Header>
        <div class="space-y-3 px-4">
          {#each CATEGORIES as category, idx (idx)}
            {@const key = `categories.${category.slug}`}
            <a
              href={`/categories/${category.slug}`}
              onclick={() => (categoriesSheetOpen = !categoriesSheetOpen)}
              class={buttonVariants({
                variant: 'outline',
                size: 'lg',
                class: 'w-full justify-start rounded-full text-lg',
              })}
            >
              <CrownIcon />
              <span>{m[key]()}</span>
            </a>
          {/each}
        </div>
        <Sheet.Footer />
      </Sheet.Content>
    </Sheet.Root>

    <div class="flex items-center justify-center">
      <Sheet.Root bind:open={createSheetOpen}>
        <Sheet.Trigger
          class="inline-flex size-12 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow-xs ring-4 ring-white"
        >
          <PlusIcon class="size-8" />
          <span class="sr-only">{m['navbar.create']()}</span>
        </Sheet.Trigger>

        <Sheet.Content class="z-50 rounded-t-xl" side="bottom" showCloseButton={true}>
          <Sheet.Header class="flex-row items-center gap-2">
            <PlusIcon class="size-5" />
            <Sheet.Title>{m['navbar.create']()}</Sheet.Title>
          </Sheet.Header>
          <div class="space-y-3 px-4">
            <a
              href="/stories/new"
              onclick={() => (createSheetOpen = !createSheetOpen)}
              class={buttonVariants({
                variant: 'outline',
                size: 'lg',
                class: 'w-full justify-start rounded-full text-lg',
              })}
            >
              <CirclePlusIcon class="size-4" />{m['navbar.new-story']()}
            </a>

            <a
              href="/dashboard"
              onclick={() => (createSheetOpen = !createSheetOpen)}
              class={buttonVariants({
                variant: 'outline',
                size: 'lg',
                class: 'w-full justify-start rounded-full text-lg',
              })}
            >
              <CirclePlusIcon class="size-4" />{m['navbar.add-chapter']()}
            </a>
          </div>
          <Sheet.Footer />
        </Sheet.Content>
      </Sheet.Root>
    </div>

    <a href="/reading-lists" class="group inline-flex flex-col items-center justify-center px-5">
      <LibraryBigIcon class="size-6.5" />
      <span class="sr-only">{m['navbar.reading-lists']()}</span>
    </a>

    <Sheet.Root bind:open={userSheetOpen}>
      {#if $session?.isPending}
        <div class="flex items-center justify-center">
          <Skeleton class="size-8 rounded-full bg-muted-foreground" />
        </div>
      {:else if $session?.data?.user}
        <Sheet.Trigger
          class="group inline-flex flex-col items-center justify-center rounded-e-full px-5"
        >
          <Avatar.Root class="size-9 border">
            <Avatar.Image src={$session.data.user?.image} alt={$session.data.user.name} />
            <Avatar.Fallback>{$session.data.user.name[0]}</Avatar.Fallback>
          </Avatar.Root>
          <span class="sr-only">{m['navbar.user']()}</span>
        </Sheet.Trigger>
      {:else}
        <Sheet.Trigger
          class="group inline-flex flex-col items-center justify-center rounded-e-full px-5"
        >
          <UserRoundIcon class="size-7" />
          <span class="sr-only">{m['navbar.user']()}</span>
        </Sheet.Trigger>
      {/if}

      <Sheet.Content class="z-50 rounded-t-xl" side="bottom" showCloseButton={true}>
        {#if $session?.data?.user}
          <Sheet.Header class="flex-row items-center gap-2">
            <Avatar.Root class="size-8 border">
              <Avatar.Image src={$session.data.user?.image} alt={$session.data.user.name} />
              <Avatar.Fallback>{$session.data.user.name[0]}</Avatar.Fallback>
            </Avatar.Root>

            <Sheet.Title>{m['navbar.hi']({ name: $session.data.user.name })}</Sheet.Title>
          </Sheet.Header>

          <div class="space-y-3 px-4">
            <a
              href={`/user/${$session.data.user.username}`}
              onclick={() => (userSheetOpen = !userSheetOpen)}
              class={buttonVariants({
                variant: 'outline',
                size: 'lg',
                class: 'w-full justify-start rounded-full text-lg',
              })}
            >
              <UserRoundIcon class="size-4" />{m['navbar.profile']()}
            </a>

            <a
              href="/dashboard"
              onclick={() => (userSheetOpen = !userSheetOpen)}
              class={buttonVariants({
                variant: 'outline',
                size: 'lg',
                class: 'w-full justify-start rounded-full text-lg',
              })}
            >
              <CastleIcon class="size-4" />{m['navbar.dashboard']()}
            </a>

            <a
              href="/feed"
              onclick={() => (userSheetOpen = !userSheetOpen)}
              class={buttonVariants({
                variant: 'outline',
                size: 'lg',
                class: 'w-full justify-start rounded-full text-lg',
              })}
            >
              <NewspaperIcon class="size-4" />{m['navbar.feed']()}
            </a>

            <a
              href="/bookmarks"
              onclick={() => (userSheetOpen = !userSheetOpen)}
              class={buttonVariants({
                variant: 'outline',
                size: 'lg',
                class: 'w-full justify-start rounded-full text-lg',
              })}
            >
              <BookmarkIcon class="size-4" />{m['navbar.bookmarks']()}
            </a>

            <a
              href="/history"
              onclick={() => (userSheetOpen = !userSheetOpen)}
              class={buttonVariants({
                variant: 'outline',
                size: 'lg',
                class: 'w-full justify-start rounded-full text-lg',
              })}
            >
              <RotateCcwClockIcon class="size-4" />{m['navbar.history']()}
            </a>

            <a
              href="/settings"
              onclick={() => (userSheetOpen = !userSheetOpen)}
              class={buttonVariants({
                variant: 'outline',
                size: 'lg',
                class: 'w-full justify-start rounded-full text-lg',
              })}
            >
              <SettingsIcon class="size-4" />{m['navbar.settings']()}
            </a>
          </div>

          <Sheet.Footer>
            <Button
              variant="destructive"
              onclick={handleSignOut}
              class="w-full rounded-full text-lg"
            >
              <LogOutIcon class="size-4" />{m['navbar.sign-out']()}
            </Button>
          </Sheet.Footer>
        {:else}
          <Sheet.Header>
            <Sheet.Title
              >Do more with <span class="font-sans font-thin tracking-widest">fancanon</span
              ></Sheet.Title
            >
            <Sheet.Description>
              Publish stories, add stories to reading list, follow authors and more.
            </Sheet.Description>
          </Sheet.Header>

          <div class="space-y-3 px-4">
            <div class="rounded-xl bg-linear-[to_right,#4285F4,#EA4335,#FBBC05,#34A853] p-[4px]">
              <Item.Root
                class="bg-card dark:hover:bg-input/30"
                onclick={() => continueWithGoogle(redirect)}
              >
                <Item.Media variant="icon">
                  <Google />
                </Item.Media>
                <Item.Content>
                  <Item.Title class="font-sans">{m['navbar.sign-in-with-google']()}</Item.Title>
                </Item.Content>

                <Item.Media variant="icon">
                  <ChevronRightIcon />
                </Item.Media>
              </Item.Root>
            </div>

            <div class="text-center">
              <a
                href={`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`}
                class="text-muted-foreground underline underline-offset-4"
              >
                or continue with email
              </a>
            </div>
          </div>

          <Sheet.Footer />
        {/if}
      </Sheet.Content>
    </Sheet.Root>
  </div>
</footer>
