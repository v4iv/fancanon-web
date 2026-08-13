<script lang="ts">
  import type { Component } from 'svelte'
  import type { PageProps } from './$types'
  import { goto } from '$app/navigation'
  import { numify } from 'numify'
  import { toast } from 'svelte-sonner'
  import { formatDistanceToNow } from 'date-fns'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import {
    CalendarIcon,
    CircleAlertIcon,
    CircleCheckIcon,
    CrownIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    FlagIcon,
    HeartIcon,
    ListIcon,
    PencilIcon,
    RectangleEllipsisIcon,
    Trash2Icon,
    VenetianMaskIcon,
    WholeWordIcon,
  } from '@lucide/svelte'
  import { captureException } from '@sentry/sveltekit'

  import { track } from '$lib/analytics'
  import { useSession } from '$lib/client'
  import { m } from '$lib/paraglide/messages.js'
  import type { StoryTagWithTag } from '$lib/types'
  import { Helmet } from '$lib/components/helmet'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { Badge } from '$lib/components/ui/badge'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { LikeButton } from '$lib/components/like-button'
  import { ShareWidget } from '$lib/components/sharing'
  import { ReadLaterButton } from '$lib/components/read-later-button'
  import { ChaptersList } from '$lib/components/chapters-list'
  import { ReportStory } from '$lib/components/reporting'

  let { data }: PageProps = $props()

  let openReportDialog = $state(false)

  const session = useSession()

  const client = useQueryClient()

  // svelte-ignore state_referenced_locally
  const timestamp = formatDistanceToNow(new Date(data.story.createdAt)) + ' ago'

  let likesCount = $derived(data.story.likeCount)
  let like = $derived(Boolean(data.story.likes.length > 0))
  let readLaterCount = $derived(data.story.readLaterCount)
  let readLater = $derived(Boolean(data.story.readLaters.length > 0))
  let isAuthor = $derived(Boolean($session?.data?.user?.id === data.story.author.id))
  const groupedTags = $derived.by(() => {
    const all: StoryTagWithTag[] = data.story.tags
    return {
      relationships: all.filter((t) => t.tag.type === 'RELATIONSHIP'),
      characters: all.filter((t) => t.tag.type === 'CHARACTER'),
      warnings: all.filter((t) => t.tag.type === 'WARNING'),
      other: all.filter((t) => t.tag.type === 'FREEFORM' || t.tag.type === 'FANDOM_FREEFORM'),
    }
  })
  const SECTION_ICONS: Record<string, Component> = {
    Relationships: HeartIcon,
    Characters: VenetianMaskIcon,
    Warnings: CircleAlertIcon,
    'Additional Tags': RectangleEllipsisIcon,
  }

  const deleteStory = async (): Promise<any> => {
    const res = await fetch(`/api/stories/${data.story.id}/delete`, { method: 'DELETE' })

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
        description: `The story, '${data.story?.title}' has been deleted.`,
      })
      goto('/stories')
    },
    onError: (error) => {
      toast('Error Deleting Story', {
        description: `There was an error deleting the story, '${data.story?.title}'.`,
      })
      captureException(error)
    },
    onSettled: () => {
      track('delete_story', {
        title: data.story.title,
      })
      client.invalidateQueries({ queryKey: ['user'] })
      client.invalidateQueries({ queryKey: ['new'] })
      client.invalidateQueries({ queryKey: ['hot'] })
    },
  }))
</script>

<Helmet title={`${data.story.title} | fancanon`} />

<div class="min-h-screen">
  <div class="mx-auto w-full max-w-screen-lg space-y-3 px-3 py-5">
    <div class="flex items-center">
      <div class="flex grow flex-wrap items-center gap-2">
        <Badge variant={data.story.contentRating === 'EXPLICIT' ? 'destructive' : 'default'}>
          {data.story.contentRating}
        </Badge>

        <Badge variant="outline" class="capitalize">
          {data.story.completed ? m['story.completed']() : m['story.ongoing']()}
        </Badge>

        <Badge variant="secondary" class="capitalize">
          {data.story.language}
        </Badge>
      </div>
      <div class="flex items-center gap-2">
        <ShareWidget path={`/stories/${data.story.id}`} />

        <Tooltip.Root>
          <Tooltip.Trigger>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                class={buttonVariants({ variant: 'ghost', size: 'icon-lg', class: 'rounded-full' })}
              >
                <EllipsisVerticalIcon class="size-4" />
                <span class="sr-only">{m['story.more-options']()}</span>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content class="w-full">
                <DropdownMenu.Group>
                  {#if isAuthor}
                    <DropdownMenu.Item>
                      <a
                        href={`/stories/${data.story.id}/edit`}
                        class="flex w-full items-center gap-2"
                      >
                        <PencilIcon class="mr-2 size-4" />
                        <span>{m['story.edit']()}</span>
                      </a>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      class="cursor-pointer"
                      variant="destructive"
                      onclick={(event) => {
                        const confirmDelete = confirm(m['story.delete-confirmation']())

                        if (confirmDelete) {
                          deleteStoryMutation.mutate()
                        } else {
                          event.preventDefault()
                        }
                      }}
                    >
                      <Trash2Icon class="mr-2" />
                      <span>{m['story.delete']()}</span>
                    </DropdownMenu.Item>
                  {:else}
                    <DropdownMenu.Item
                      class="cursor-pointer"
                      variant="destructive"
                      onclick={() => (openReportDialog = !openReportDialog)}
                    >
                      <FlagIcon class="mr-2" />
                      <span>{m['story.report']()}</span>
                    </DropdownMenu.Item>
                  {/if}
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Tooltip.Trigger>

          <Tooltip.Content>
            <p>{m['story.more-options']()}</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </div>
    </div>

    <header class="flex flex-col gap-3">
      <!-- Title -->
      <h1 class="font-heading text-3xl md:text-5xl">{data.story.title}</h1>

      <!-- Fandoms -->
      <div class="flex flex-wrap items-center gap-2 text-lg text-muted-foreground">
        {#each data.story.fandoms as { fandom }, idx (idx)}
          <Button variant="secondary" href={`/fandoms/${fandom.slug}`} class="rounded-full">
            <CrownIcon />{fandom.name}
          </Button>
        {/each}
      </div>

      <p class="text-md md:text-lg">{data.story.description}</p>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Author & Timestamp -->
        <div class="flex flex-wrap items-center gap-2">
          <a href={`/user/${data.story.author.username}`}>
            <Avatar.Root class="size-5 border">
              <Avatar.Image src={data.story.author.image ?? ''} alt={data.story.author.name} />
              <Avatar.Fallback>{data.story.author.name[0]}</Avatar.Fallback>
              <span class="sr-only">{data.story.author.name}</span>
            </Avatar.Root>
          </a>
          <p class="font-mono text-sm">
            <a
              class="tracking-wider text-primary underline-offset-4 hover:text-muted-foreground hover:underline"
              href={`/user/${data.story.author.username}`}
            >
              @{data.story.author.username}
            </a>
          </p>
          &bull;
          <CalendarIcon class="size-4 text-muted-foreground" />
          <p class="text-sm text-muted-foreground">{timestamp}</p>
        </div>

        <!-- Like & Read Later -->
        <div class="flex items-center gap-2 md:justify-end">
          <LikeButton
            bind:like
            bind:likesCount
            storyId={data.story.id}
            storyTitle={data.story.title}
            user={$session?.data?.user}
            class={buttonVariants({
              variant: like ? 'secondary' : 'outline',
              size: 'lg',
              class: 'rounded-full',
            })}
          >
            {#if likesCount === 0}
              {like ? m['story.unlike']() : m['story.like']()}
            {:else}
              {#if like}
                <span class="flex h-5 items-center gap-2"
                  >{m['story.unlike']()}
                  <Separator orientation="vertical" />
                  {numify(likesCount)}</span
                >
              {:else}
                <span class="flex h-5 items-center gap-2"
                  >{m['story.like']()}
                  <Separator orientation="vertical" />
                  {numify(likesCount)}</span
                >
              {/if}
            {/if}
          </LikeButton>

          <ReadLaterButton
            bind:readLater
            bind:readLaterCount
            storyId={data.story.id}
            storyTitle={data.story.title}
            user={$session?.data?.user}
            class={buttonVariants({
              variant: readLater ? 'secondary' : 'outline',
              size: 'lg',
              class: 'rounded-full',
            })}
          >
            {#if readLaterCount === 0}
              {readLater ? m['story.in-read-later']() : m['story.read-later']()}
            {:else}
              {#if readLater}
                <span class="flex h-5 items-center gap-2"
                  >{m['story.in-read-later']()}
                  <Separator orientation="vertical" />
                  {numify(readLaterCount)}</span
                >
              {:else}
                <span class="flex h-5 items-center gap-2"
                  >{m['story.read-later']()}
                  <Separator orientation="vertical" />
                  {numify(readLaterCount)}</span
                >
              {/if}
            {/if}
          </ReadLaterButton>
        </div>
      </div>

      <!-- Tags -->
      <div class="my-3 space-y-2 rounded-xl border p-5">
        <!-- Warning Tags -->
        <div class="flex items-center gap-2">
          <CircleAlertIcon class="size-4 text-muted-foreground" />
          <p class="font-heading font-semibold tracking-wide uppercase">{m['story.warnings']()}</p>
        </div>

        <div class="flex flex-wrap items-center gap-2 py-2 font-mono">
          {#if groupedTags.warnings.length === 0}
            <span class="px-2 text-muted-foreground">—</span>
          {:else}
            {#each groupedTags.warnings as { tag }, idx (idx)}
              {#if tag.name === 'no warnings apply'}
                <Badge variant="outline" class="border border-green-500 capitalize">
                  <CircleCheckIcon class="text-green-500" />{tag.name}
                </Badge>
              {:else}
                <Badge variant="outline" class="border border-destructive capitalize">
                  <CircleAlertIcon class="text-destructive" />{tag.name}
                </Badge>
              {/if}
            {/each}
          {/if}
        </div>
        {@render tagSection('relationships', groupedTags.relationships)}
        {@render tagSection('characters', groupedTags.characters)}
        {@render tagSection('additional-tags', groupedTags.other)}
      </div>
    </header>
  </div>

  <div class="space-y-5">
    <div class="border-y py-3">
      <div
        class="mx-auto flex h-6 w-full max-w-screen-lg items-center justify-evenly px-2 font-mono text-sm font-semibold"
      >
        <Tooltip.Root>
          <Tooltip.Trigger>
            <div class="flex items-center space-x-2">
              <ListIcon class="size-4" />
              <span>{data.story.chapterCount}</span>
              <span class="sr-only">
                {m['story.chapters']({ count: data.story.chapterCount })}
              </span>
            </div>
          </Tooltip.Trigger>

          <Tooltip.Content>
            <p>
              {m['story.chapters']({ count: data.story.chapterCount })}
            </p>
          </Tooltip.Content>
        </Tooltip.Root>

        <Separator orientation="vertical" />

        <Tooltip.Root>
          <Tooltip.Trigger>
            <div class="flex items-center space-x-2">
              <WholeWordIcon class="size-4" />
              <span>
                {numify(data.story.wordCount)}
              </span>

              <span class="sr-only">
                {m['story.words']({ count: numify(data.story.wordCount) })}
              </span>
            </div>
          </Tooltip.Trigger>

          <Tooltip.Content>
            <p>
              {m['story.words']({ count: numify(data.story.wordCount) })}
            </p>
          </Tooltip.Content>
        </Tooltip.Root>

        <Separator orientation="vertical" />

        <Tooltip.Root>
          <Tooltip.Trigger>
            <div class="flex items-center space-x-2">
              <EyeIcon class="size-4" />
              <span>
                {numify(data.story.viewCount)}
              </span>
              <span class="sr-only">
                {m['story.views']({ count: numify(data.story.viewCount) })}
              </span>
            </div>
          </Tooltip.Trigger>

          <Tooltip.Content>
            <p>
              {m['story.views']({ count: numify(data.story.viewCount) })}
            </p>
          </Tooltip.Content>
        </Tooltip.Root>
      </div>
    </div>

    <!-- Chapters -->
    <ChaptersList storyId={data.story.id} {isAuthor} />
  </div>
</div>

<ReportStory
  open={openReportDialog}
  onOpenChange={() => (openReportDialog = !openReportDialog)}
  storyId={data.story.id}
/>

{#snippet tagSection(label: string, tags: StoryTagWithTag[])}
  {@const Icon = SECTION_ICONS[label]}
  <div class="flex items-center gap-2">
    {#if Icon}
      <Icon class="size-4 text-muted-foreground" />
    {/if}
    <p class="font-heading font-semibold tracking-wide uppercase">{m[`story.${label}`]()}</p>
  </div>

  <div class="flex flex-wrap items-center font-mono">
    {#if tags.length === 0}
      <span class="px-2 text-muted-foreground">—</span>
    {:else}
      {#each tags as { tag }, idx (idx)}
        <Button
          variant="link"
          href={`/tags/${tag.slug}`}
          class="gap-1/2 rounded-full px-2 hover:text-muted-foreground md:first:pl-0"
        >
          {tag.name}
          {#if tag.type === 'FANDOM_FREEFORM'}
            <CrownIcon class="ml-1 size-3" />
          {/if}
        </Button>
      {/each}
    {/if}
  </div>
{/snippet}
