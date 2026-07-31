<script lang="ts">
  import { goto } from '$app/navigation'
  import { useQueryClient } from '@tanstack/svelte-query'
  import {
    PlusIcon,
    HouseIcon,
    LogInIcon,
    ListTreeIcon,
    NewspaperIcon,
    UserRoundIcon,
    UserRoundPlusIcon,
    CrownIcon,
    ChevronRightIcon,
    OrbitIcon,
    BookmarkIcon,
    ClockIcon,
    SettingsIcon,
    LogOutIcon,
  } from '@lucide/svelte'

  import { CATEGORIES } from '$lib/constants'
  import { m } from '$lib/paraglide/messages.js'
  import { signOut, useSession } from '$lib/client'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Sheet from '$lib/components/ui/sheet'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as Collapsible from '$lib/components/ui/collapsible'
  import { Skeleton } from '$lib/components/ui/skeleton'

  let open = $state(true)
  const session = useSession()
  const client = useQueryClient()

  const handleSignOut = async () => {
    await signOut()

    client.invalidateQueries()

    goto(`/auth/sign-in`)
  }
</script>

<footer class="fixed right-0 bottom-0 left-0 z-40 flex h-16 w-full border bg-muted md:hidden">
  <div class="flex w-full items-center justify-between gap-2 p-4">
    <Button variant="outline" size="lg" class="rounded-full">
      <HouseIcon class="size-6" />
      <span class="sr-only">{m['navbar.home']()}</span>
    </Button>

    <Sheet.Root>
      <Sheet.Trigger
        class={buttonVariants({ variant: 'outline', size: 'lg', class: 'rounded-full' })}
      >
        <ListTreeIcon class="size-6" />
        <span class="sr-only">{m['navbar.categories']()}</span>
      </Sheet.Trigger>

      <Sheet.Content class="z-50" side="bottom">
        <Sheet.Header />
        <div class="space-y-3 p-4">
          <a
            href="/"
            class={buttonVariants({
              variant: 'secondary',
              size: 'lg',
              class: 'w-full',
            })}
          >
            <OrbitIcon class="size-4" />
            <span>{m['sidebar.crossovers']()}</span>
          </a>

          <a
            href="/"
            class={buttonVariants({
              variant: 'secondary',
              size: 'lg',
              class: 'w-full',
            })}
          >
            <BookmarkIcon class="size-4" />
            <span>{m['sidebar.bookmarks']()}</span>
          </a>

          <a
            href="/"
            class={buttonVariants({
              variant: 'secondary',
              size: 'lg',
              class: 'w-full',
            })}
          >
            <ClockIcon class="size-4" />
            <span>{m['sidebar.reading-lists']()}</span>
          </a>

          <Collapsible.Root bind:open class="group/collapsible">
            <Collapsible.Trigger>
              {#snippet child({ props })}
                <Button variant="ghost" class="w-full" {...props}>
                  <CrownIcon />
                  <span>{m['sidebar.categories']()}</span>
                  <ChevronRightIcon
                    class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </Button>
              {/snippet}
            </Collapsible.Trigger>

            <Collapsible.Content>
              {#each CATEGORIES as category, idx (idx)}
                {@const key = `categories.${category.slug}`}
                <a
                  href={`/categories/${category.slug}`}
                  class={buttonVariants({
                    variant: 'ghost',
                    size: 'lg',
                    class: 'w-full',
                  })}
                >
                  <span>{m[key]()}</span>
                </a>
              {/each}
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      </Sheet.Content>
    </Sheet.Root>

    <Sheet.Root>
      <Sheet.Trigger
        class={buttonVariants({ variant: 'default', size: 'lg', class: 'rounded-full p-4' })}
      >
        <PlusIcon class="size-8" />
        <span class="sr-only">{m['navbar.create']()}</span>
      </Sheet.Trigger>

      <Sheet.Content class="z-50" side="bottom">
        <Sheet.Header>
          {m['navbar.create']()}
        </Sheet.Header>

        <div class="space-y-3 p-4">
          <a
            href="/stories/new"
            class={buttonVariants({ variant: 'secondary', size: 'lg', class: 'w-full text-lg' })}
          >
            <PlusIcon class="size-4" />{m['navbar.new-story']()}
          </a>

          <a
            href="/dashboard"
            class={buttonVariants({ variant: 'secondary', size: 'lg', class: 'w-full text-lg' })}
          >
            <PlusIcon class="size-4" />{m['navbar.add-chapter']()}
          </a>
        </div>
      </Sheet.Content>
    </Sheet.Root>

    <Button variant="outline" size="lg" class="rounded-full">
      <NewspaperIcon class="size-6" />
      <span class="sr-only">{m['navbar.feed']()}</span>
    </Button>

    {#if $session?.isPending}
      <Skeleton class="size-9 w-11.5 rounded-full bg-muted-foreground" />
    {:else if $session.data}
      <Sheet.Root>
        <Sheet.Trigger
          class={buttonVariants({ variant: 'outline', size: 'lg', class: 'rounded-full' })}
        >
          <UserRoundIcon class="size-6" />
          <span class="sr-only">{m['navbar.user-menu']()}</span>
        </Sheet.Trigger>

        <Sheet.Content class="z-50" side="bottom">
          <Sheet.Header class="items-center gap-2">
            <Avatar.Root class="size-9 border">
              <Avatar.Image src={$session.data.user?.image} alt={$session.data.user.name} />
              <Avatar.Fallback>{$session.data.user.name[0]}</Avatar.Fallback>

              <span class="sr-only">{m['navbar.user-menu']()}</span>
            </Avatar.Root>
            <p>{m['navbar.hi']({ name: $session.data.user.name })}</p>
          </Sheet.Header>

          <div class="space-y-3 p-4">
            <a
              href={`/user/${$session.data.user.username}`}
              class={buttonVariants({ variant: 'secondary', size: 'lg', class: 'w-full text-lg' })}
            >
              <UserRoundIcon class="size-4" />{m['navbar.profile']()}
            </a>

            <a
              href="/settings"
              class={buttonVariants({ variant: 'secondary', size: 'lg', class: 'w-full text-lg' })}
            >
              <SettingsIcon class="size-4" />{m['navbar.settings']()}
            </a>
            <Button variant="destructive" onclick={handleSignOut} class="w-full text-lg">
              <LogOutIcon class="size-4" />{m['navbar.sign-out']()}
            </Button>
          </div>
        </Sheet.Content>
      </Sheet.Root>
    {:else}
      <Sheet.Root>
        <Sheet.Trigger
          class={buttonVariants({ variant: 'outline', size: 'lg', class: 'rounded-full' })}
        >
          <UserRoundIcon class="size-6" />
          <span class="sr-only">{m['navbar.user-menu']()}</span>
        </Sheet.Trigger>

        <Sheet.Content class="z-50" side="bottom">
          <Sheet.Header />
          <div class="space-y-3 p-4">
            <a
              href="/auth/sign-in"
              class={buttonVariants({ variant: 'secondary', size: 'lg', class: 'w-full text-lg' })}
            >
              <LogInIcon class="size-4" />{m['navbar.sign-in']()}
            </a>

            <a
              href="/auth/sign-up"
              class={buttonVariants({ variant: 'secondary', size: 'lg', class: 'w-full text-lg' })}
            >
              <UserRoundPlusIcon class="size-4" />{m['navbar.sign-up']()}
            </a>
          </div>
        </Sheet.Content>
      </Sheet.Root>
    {/if}
  </div>
</footer>
