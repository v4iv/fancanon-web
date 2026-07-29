<script lang="ts">
  import {
    PlusIcon,
    HouseIcon,
    LogInIcon,
    ListTreeIcon,
    NewspaperIcon,
    UserRoundIcon,
    UserRoundPlusIcon,
  } from '@lucide/svelte'

  import * as Sheet from '$lib/components/ui/sheet'
  import { Button, buttonVariants } from '$lib/components/ui/button'
</script>

<footer class="fixed right-0 bottom-0 left-0 z-40 flex h-16 w-full border bg-muted md:hidden">
  <div class="flex w-full items-center justify-between gap-2 p-4">
    <Button variant="outline" size="lg" class="rounded-full">
      <HouseIcon class="size-6" />
      <span class="sr-only">Home</span>
    </Button>

    <Sheet.Root>
      <Sheet.Trigger
        class={buttonVariants({ variant: 'outline', size: 'lg', class: 'rounded-full' })}
      >
        <ListTreeIcon class="size-6" />
        <span class="sr-only">Categories</span>
      </Sheet.Trigger>

      <Sheet.Content class="z-50" side="bottom">
        <Sheet.Header />
        <div class="space-y-3 p-4"></div>
        <Sheet.Footer />
      </Sheet.Content>
    </Sheet.Root>

    <Sheet.Root>
      <Sheet.Trigger
        class={buttonVariants({ variant: 'default', size: 'lg', class: 'rounded-full p-4' })}
      >
        <PlusIcon class="size-8" />
        <span class="sr-only">Create</span>
      </Sheet.Trigger>

      <Sheet.Content class="z-50" side="bottom">
        <Sheet.Header />
        <div class="space-y-3 p-4">
          <a href="/" class="flex items-center gap-2 text-2xl">
            <PlusIcon class="size-4" />New Story
          </a>

          <a href="/" class="flex items-center gap-2 text-2xl">
            <PlusIcon class="size-4" />Add New Chapter
          </a>
        </div>
        <Sheet.Footer />
      </Sheet.Content>
    </Sheet.Root>

    <Button variant="outline" size="lg" class="rounded-full">
      <NewspaperIcon class="size-6" />
      <span class="sr-only">Feed</span>
    </Button>

    <Sheet.Root>
      <Sheet.Trigger
        class={buttonVariants({ variant: 'outline', size: 'lg', class: 'rounded-full' })}
      >
        <UserRoundIcon class="size-6" />
        <span class="sr-only">User Options</span>
      </Sheet.Trigger>

      <Sheet.Content class="z-50" side="bottom">
        <Sheet.Header />
        <div class="space-y-3 p-4">
          <a href="/" class="flex items-center gap-2 text-2xl">
            <LogInIcon class="size-4" />Sign In
          </a>

          <a href="/" class="flex items-center gap-2 text-2xl">
            <UserRoundPlusIcon class="size-4" />Sign Up
          </a>
        </div>
        <Sheet.Footer />
      </Sheet.Content>
    </Sheet.Root>
  </div>
</footer>
