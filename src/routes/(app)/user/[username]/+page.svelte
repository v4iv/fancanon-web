<script lang="ts">
  import type { PageProps } from './$types'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { numify } from 'numify'
  import { toast } from 'svelte-sonner'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import {
    CalendarIcon,
    EllipsisVerticalIcon,
    FlagIcon,
    Share2Icon,
    UserMinusIcon,
    UserPenIcon,
    UserPlus,
  } from '@lucide/svelte'
  import { captureException } from '@sentry/sveltekit'

  import { useSession } from '$lib/client'
  import { track } from '$lib/analytics'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Tabs from '$lib/components/ui/underline-tabs'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Helmet } from '$lib/components/helmet'
  import { ReportUser } from '$lib/components/reporting'
  import { CommentFeed, LikeFeed, StoryFeed } from '$lib/components/user'

  let { data }: PageProps = $props()

  let openReportDialog = $state(false)

  const session = useSession()

  const client = useQueryClient()

  let following = $derived(Boolean(data.user.followers?.length > 0))
  let storyCount = $derived(data.storyCount)
  let followersCount = $derived(data.followersCount)
  let followingCount = $derived(data.followingCount)

  const followUser = async (username: string) => {
    const res = await fetch(`/api/user/${username}/follow`)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const unfollowUser = async (username: string) => {
    const res = await fetch(`/api/user/${username}/unfollow`, { method: 'DELETE' })

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const followUserMutation = createMutation(() => ({
    mutationFn: followUser,
    onMutate: async () => {
      await client.cancelQueries()
      followersCount += 1
      following = true

      return
    },
    onError: (error) => {
      followersCount -= 1
      following = false
      captureException(error)
    },
    onSettled: () => {
      track('follow')
      client.invalidateQueries({ queryKey: ['user'] })
    },
  }))

  const unfollowUserMutation = createMutation(() => ({
    mutationFn: unfollowUser,
    onMutate: async () => {
      await client.cancelQueries()
      followersCount -= 1
      following = false

      return
    },
    onError: (error) => {
      followersCount += 1
      following = true
      captureException(error)
    },
    onSettled: () => {
      track('unfollow')
      client.invalidateQueries({ queryKey: ['user'] })
    },
  }))

  let joinedDate = $derived.by(() =>
    new Date(data?.user?.createdAt).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    }),
  )

  let username = $derived(page.params.username ?? data.user.username)

  function getAvatarUrl(image?: string | null): string | undefined {
    if (!image) return image ?? undefined
    try {
      const url = new URL(image)
      if (url.hostname === 'gravatar.com' || url.hostname.endsWith('.gravatar.com')) {
        url.searchParams.set('s', '200')
        return url.toString()
      }
      return image
    } catch {
      // Invalid URL, return as-is
      return image
    }
  }
</script>

<Helmet title={`${data.user.name} (@${data.user.username}) | fancanon`} />
<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="relative min-h-screen w-full space-y-5">
  <div class="mx-auto w-full max-w-screen-lg space-y-3 px-3 py-5">
    <div class="flex items-center gap-5">
      <Avatar.Root class="size-24 shadow-md ring-6 ring-background md:size-44">
        <Avatar.Fallback>{data.user?.name[0]}</Avatar.Fallback>
        <Avatar.Image src={getAvatarUrl(data.user?.image)} alt={data.user?.name} />
      </Avatar.Root>

      <header class="w-full space-y-2">
        <div class="grid w-full grid-cols-2 items-center gap-3">
          <div class="col-span-2 md:col-span-1">
            <div class="flex items-center gap-2">
              <div class="grow">
                <h1 class="text-2xl font-semibold text-wrap break-all">
                  {data?.user?.username}
                </h1>
              </div>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger
                  class={buttonVariants({
                    variant: 'outline',
                    size: 'icon-lg',
                    class: 'flex rounded-full md:hidden',
                  })}
                >
                  <EllipsisVerticalIcon class="size-4" />
                  <span class="sr-only">Options</span>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content class="w-full">
                  <DropdownMenu.Group>
                    <DropdownMenu.Item
                      class="cursor-pointer"
                      onclick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast('Link copied to clipboard')
                      }}
                    >
                      <Share2Icon />
                      <span>Share Profile</span>
                    </DropdownMenu.Item>

                    {#if $session?.data?.user?.id !== data.user.id}
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        variant="destructive"
                        class="cursor-pointer"
                        onclick={() => (openReportDialog = !openReportDialog)}
                      >
                        <FlagIcon />
                        <span>Report</span>
                      </DropdownMenu.Item>
                    {/if}
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>

          <div class="col-span-2 md:col-span-1">
            <div class="flex items-center gap-2">
              <div class="grow">
                {#if $session?.data?.user.id}
                  {#if $session?.data?.user.id !== data?.user?.id}
                    <Button
                      variant="secondary"
                      class="w-full font-bold"
                      onclick={() => {
                        if (following) {
                          unfollowUserMutation.mutate(username)
                        } else {
                          followUserMutation.mutate(username)
                        }
                      }}
                    >
                      {#if following}
                        <UserMinusIcon className="size-4" />
                        Unfollow
                      {:else}
                        <UserPlus className="size-4" />
                        Follow
                      {/if}
                      {following ? '' : ''}
                    </Button>
                  {:else}
                    <Button variant="secondary" class="w-full font-bold" href="/settings">
                      <UserPenIcon className="size-4" />
                      Edit Profile
                    </Button>
                  {/if}
                {:else}
                  <Button
                    variant="secondary"
                    class="w-full font-bold"
                    onclick={() =>
                      goto(
                        `/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`,
                      )}
                  >
                    <UserPlus className="size-4" />
                    Follow
                  </Button>
                {/if}
              </div>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger
                  class={buttonVariants({
                    variant: 'outline',
                    size: 'icon-lg',
                    class: 'hidden rounded-full md:flex',
                  })}
                >
                  <EllipsisVerticalIcon class="size-4" />
                  <span class="sr-only">Options</span>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content class="w-full">
                  <DropdownMenu.Group>
                    <DropdownMenu.Item
                      class="cursor-pointer"
                      onclick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast('Link copied to clipboard')
                      }}
                    >
                      <Share2Icon />
                      <span>Share Profile</span>
                    </DropdownMenu.Item>

                    {#if $session?.data?.user?.id !== data.user.id}
                      <DropdownMenu.Separator />

                      <DropdownMenu.Item
                        variant="destructive"
                        class="cursor-pointer"
                        onclick={() => (openReportDialog = !openReportDialog)}
                      >
                        <FlagIcon />
                        <span>Report</span>
                      </DropdownMenu.Item>
                    {/if}
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>

        <div class="hidden space-y-2 gap-y-1 text-sm md:flex md:flex-col">
          <div class="flex items-center gap-2">
            <p class="font-mono text-xs font-semibold text-muted-foreground">
              {numify(followersCount)} Followers
            </p>
            &bull;
            <p class="font-mono text-xs font-semibold text-muted-foreground">
              {numify(followingCount)} Following
            </p>
          </div>

          <p class="font-heading text-xl">{data?.user?.name}</p>

          <div class="flex items-center space-x-2 text-muted-foreground">
            <CalendarIcon class="size-4" />
            <p>Joined {joinedDate}</p>
          </div>
        </div>
      </header>
    </div>

    <div class="flex flex-col gap-y-1 text-sm md:hidden">
      <p class=" font-bold">{data?.user?.name}</p>

      <div class="flex items-center gap-2">
        <p class="font-mono text-xs font-semibold text-muted-foreground">
          {numify(followersCount)} Followers
        </p>
        &bull;
        <p class="font-mono text-xs font-semibold text-muted-foreground">
          {numify(followingCount)} Following
        </p>
      </div>

      <div class="flex items-center gap-x-2 text-muted-foreground">
        <CalendarIcon class="size-4" />
        <p>Joined {joinedDate}</p>
      </div>
    </div>
  </div>

  <div class="w-full">
    {#if $session?.data?.user.id === data.user.id}
      <Tabs.Root value="stories" class="relative w-full">
        <Tabs.List class="sticky top-0 z-30 w-full bg-background">
          <div class="mx-auto flex w-full max-w-screen-lg items-center px-3">
            <Tabs.Trigger class="w-full" value="stories">
              Stories ({numify(storyCount)})
            </Tabs.Trigger>

            <Tabs.Trigger class="w-full" value="likes">Likes</Tabs.Trigger>

            <Tabs.Trigger class="w-full" value="comments">Comments</Tabs.Trigger>
          </div>
        </Tabs.List>

        <div class="mx-auto w-full max-w-screen-lg items-center px-3">
          <Tabs.Content value="stories">
            <StoryFeed {session} />
          </Tabs.Content>

          <Tabs.Content value="likes">
            <LikeFeed {session} />
          </Tabs.Content>

          <Tabs.Content value="comments">
            <CommentFeed />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    {:else}
      <Tabs.Root value="stories" class="relative w-full">
        <Tabs.List class="sticky top-0 z-30 w-full bg-background">
          <div class="mx-auto flex w-full max-w-screen-lg items-center px-3">
            <Tabs.Trigger class="w-full" value="stories">Stories ({storyCount})</Tabs.Trigger>
          </div>
        </Tabs.List>

        <div class="mx-auto w-full max-w-screen-lg items-center px-3">
          <Tabs.Content value="stories">
            <StoryFeed {session} />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    {/if}
  </div>
</div>

<ReportUser
  userId={data.user.id}
  open={openReportDialog}
  onOpenChange={() => (openReportDialog = !openReportDialog)}
/>
