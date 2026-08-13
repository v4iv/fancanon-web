<script lang="ts">
  import { goto } from '$app/navigation'
  import { toast } from 'svelte-sonner'
  import { ORIGIN } from '$app/env/public'
  import { numify } from 'numify'
  import { formatDistanceToNow } from 'date-fns'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import {
    CalendarIcon,
    CircleAlertIcon,
    CrownIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    FlagIcon,
    ListIcon,
    MessageCircleIcon,
    PencilIcon,
    Share2Icon,
    Trash2Icon,
    UserIcon,
  } from '@lucide/svelte'
  import { captureException } from '@sentry/sveltekit'

  import { m } from '$lib/paraglide/messages.js'
  import type { StoryType } from '$lib/types'
  import { track } from '$lib/analytics'
  import * as Card from '$lib/components/ui/card'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { Badge } from '$lib/components/ui/badge'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { groupTagsByType, Tags } from '$lib/components/story-card'
  import { LikeButton } from '$lib/components/like-button'
  import { ReadLaterButton } from '$lib/components/read-later-button'
  import { CollapsibleText } from '$lib/components/collapsible-text'
  import { ReportStory } from '$lib/components/reporting'
  import { ConfirmationDialog } from '$lib/components/confirmation-dialog'

  interface Props {
    story: StoryType
    session?: any
  }

  let { story, session }: Props = $props()

  const client = useQueryClient()

  // svelte-ignore state_referenced_locally
  const timestamp = formatDistanceToNow(new Date(story.createdAt)) + ' ago'

  let like = $derived(Boolean(story.likes?.length > 0))
  let readLater = $derived(Boolean(story.readLaters?.length > 0))
  let readLaterCount = $derived(story.readLaterCount || 0)
  let likesCount = $derived(story.likeCount || 0)
  let openReportDialog = $state(false)
  let openConfirmationDialog = $state(false)
  const groupedTags = $derived.by(() => groupTagsByType(story.tags))

  const NO_WARNING_TAG_NAMES = ['author chose not to use warnings', 'no warnings apply']

  const realWarnings = $derived(
    groupedTags.warnings.filter(({ tag }) => !NO_WARNING_TAG_NAMES.includes(tag.name)),
  )

  const deleteStory = async (): Promise<any> => {
    const res = await fetch(`/api/stories/${story.id}/delete`, { method: 'DELETE' })

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const deleteStoryMutation = createMutation(() => ({
    mutationFn: deleteStory,
    onMutate: async () => {
      await client.cancelQueries()

      return
    },
    onSuccess: () => {
      toast('Story Deleted', {
        description: `The story, '${story.title}' has been deleted.`,
      })
    },
    onError: (error) => {
      toast('Error Deleting Story', {
        description: `There was an error deleting the story, '${story.title}'.`,
      })
      captureException(error)
    },
    onSettled: () => {
      track('delete_story', {
        title: story.title,
      })
      client.invalidateQueries({ queryKey: ['user'] })
      client.invalidateQueries({ queryKey: ['hot'] })
      client.invalidateQueries({ queryKey: ['new'] })
    },
  }))
</script>

<Card.Root
  class="w-full cursor-pointer transition-shadow duration-200 hover:bg-muted/50 hover:shadow-md dark:hover:bg-input/30"
  onclick={() => {
    if (story.contentRating === 'EXPLICIT') {
      if (!$session?.data?.user) {
        openConfirmationDialog = true
      } else if (
        $session.data.user.id !== story.author.id &&
        $session.data.user.explicitConsentAt === null
      ) {
        openConfirmationDialog = true
      } else {
        goto(`/stories/${story.id}`)
      }
    } else {
      goto(`/stories/${story.id}`)
    }
  }}
>
  <Card.Header>
    <div class="flex items-center justify-between">
      <div class="mb-2 flex items-center gap-2">
        <!-- Content Rating -->
        <Badge variant={story?.contentRating === 'EXPLICIT' ? 'destructive' : 'default'}>
          {story?.contentRating}
        </Badge>

        <!-- Completion Status -->
        <Badge variant="outline" class="capitalize">
          {story?.completed ? m['story.completed']() : m['story.ongoing']()}
        </Badge>

        <!-- Language -->
        <Badge variant="secondary" class="capitalize">
          {story?.language}
        </Badge>
      </div>

      <!-- More Options -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class={buttonVariants({ variant: 'ghost', size: 'icon-lg', class: 'mb-2 rounded-full' })}
          onclick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <EllipsisVerticalIcon class="size-4" />
          <span class="sr-only">{m['story.more-options']()}</span>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content class="w-full">
          <DropdownMenu.Group>
            <DropdownMenu.Item
              onclick={async (event) => {
                event.stopPropagation()
                event.preventDefault()
                track('shared', {
                  path: `/stories/${story.id}`,
                })
                try {
                  await navigator.share({ url: `${ORIGIN}/stories/${story.id}` })
                } catch (error) {
                  console.log('Sharing Cancelled: ', error)
                }
              }}
            >
              <Share2Icon class="mr-2 size-4" />
              <span>{m['story.share']()}</span>
            </DropdownMenu.Item>
            {#if $session.data?.user?.id === story.author.id}
              <DropdownMenu.Item>
                <a href={`/stories/${story.id}/edit`} class="flex w-full items-center gap-2">
                  <PencilIcon class="mr-2 size-4" />
                  <span>{m['story.edit']()}</span>
                </a>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                class="cursor-pointer"
                variant="destructive"
                disabled={deleteStoryMutation.isPending}
                onclick={(event) => {
                  const confirmDelete = confirm(m['story.delete-confirmation']())

                  if (confirmDelete) {
                    deleteStoryMutation.mutate()
                  } else {
                    event.preventDefault()
                  }
                }}
              >
                <Trash2Icon class="mr-2 text-destructive" />
                <span>{m['story.delete']()}</span>
              </DropdownMenu.Item>
            {:else}
              <DropdownMenu.Item
                variant="destructive"
                class="cursor-pointer"
                onclick={() => (openReportDialog = !openReportDialog)}
              >
                <FlagIcon class="mr-2 size-4" />
                <span>{m['story.report']()}</span>
              </DropdownMenu.Item>
            {/if}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    <!-- Title -->
    <Card.Title class="mb-2 font-heading text-3xl font-medium">{story.title}</Card.Title>

    <!-- User and Publish Date -->
    <div class="mb-2 flex h-4 items-center gap-2 text-sm text-muted-foreground">
      <UserIcon class="size-4" />

      <a
        href={`/user/${story.author.username}`}
        onclick={(event) => {
          event.stopPropagation()
          event.preventDefault()

          goto(`/user/${story.author.username}`)
        }}
        class="w-fit p-0 font-mono tracking-wide underline-offset-4 hover:text-muted-foreground hover:underline"
      >
        @{story.author.username}
      </a>

      <Separator orientation="vertical" class="h-4" />

      <CalendarIcon class="size-4" />

      <span>{timestamp}</span>
    </div>

    <!-- Fandoms -->
    <div class="flex flex-wrap items-center gap-2">
      {#each story.fandoms as { fandom }, idx (idx)}
        <Button
          variant="secondary"
          size="sm"
          onclick={(event) => {
            event.stopPropagation()
            event.preventDefault()
            goto(`/fandoms/${fandom.slug}`)
          }}
          class="gap-1 rounded-full transition-shadow duration-200 hover:shadow-md [&_svg]:size-3"
        >
          <CrownIcon />
          {fandom.name}
        </Button>
      {/each}
    </div>
  </Card.Header>

  <Card.Content>
    <!-- Description -->
    <CollapsibleText maxLines={2} text={story.description} />

    <!-- Tags -->
    <Tags tags={story.tags} />

    <!-- Warning -->
    {#if realWarnings.length > 0}
      <div class="mt-4 flex flex-wrap items-center gap-2 py-2 font-mono">
        {#each realWarnings as { tag }, idx (idx)}
          <Badge variant="outline" class="border border-destructive capitalize">
            <CircleAlertIcon class="text-destructive" />{tag.name}
          </Badge>
        {/each}
      </div>
    {/if}
  </Card.Content>

  <Card.Footer class="items-center justify-between">
    <div class="flex items-center gap-4 text-sm">
      <!-- Chapters -->
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div class="flex items-center gap-1">
            <ListIcon class="size-4" />
            {story.chapterCount}
            <span class="sr-only">{m['story.chapters']({ count: story.chapterCount })}</span>
          </div>
        </Tooltip.Trigger>

        <Tooltip.Content>{m['story.chapters']({ count: story.chapterCount })}</Tooltip.Content>
      </Tooltip.Root>

      <!-- Views -->
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div class="flex items-center gap-1">
            <EyeIcon class="size-4" />
            {numify(story.viewCount)}
            <span class="sr-only">{m['story.views']({ count: numify(story.viewCount) })}</span>
          </div>
        </Tooltip.Trigger>

        <Tooltip.Content>{m['story.views']({ count: numify(story.viewCount) })}</Tooltip.Content>
      </Tooltip.Root>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <!-- Like Button -->
      <LikeButton
        class={buttonVariants({
          variant: like ? 'secondary' : 'ghost',
          size: 'sm',
          class: 'rounded-full',
        })}
        storyTitle={story.title}
        storyId={story.id}
        user={$session.data?.user}
        bind:like
        bind:likesCount
      >
        {likesCount > 0 ? numify(likesCount) : ''}
      </LikeButton>

      <!-- Comment Count -->
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div class="flex items-center gap-1 py-1 text-muted-foreground">
            <MessageCircleIcon class="size-4" />

            <span class="text-sm text-foreground">
              {numify(story.commentCount)}
            </span>
          </div>
        </Tooltip.Trigger>

        <Tooltip.Content>
          {m['story.comments']({
            count: numify(story.commentCount),
          })}
        </Tooltip.Content>
      </Tooltip.Root>

      <!-- Read Later Button -->
      <ReadLaterButton
        class={buttonVariants({
          variant: readLater ? 'secondary' : 'outline',
          size: 'sm',
          class: 'rounded-full',
        })}
        storyTitle={story.title}
        storyId={story.id}
        user={$session.data?.user}
        bind:readLater
        bind:readLaterCount
      >
        {readLater ? m['story.in-read-later']() : m['story.read-later']()}
      </ReadLaterButton>
    </div>
  </Card.Footer>
</Card.Root>

<ReportStory
  storyId={story.id}
  open={openReportDialog}
  onOpenChange={() => (openReportDialog = !openReportDialog)}
/>

<ConfirmationDialog
  title={m['story.confirmation-title']()}
  description={m['story.confirmation-description']()}
  path={`/stories/${story?.id}`}
  bind:open={openConfirmationDialog}
  onOpenChange={() => (openConfirmationDialog = !openConfirmationDialog)}
/>
