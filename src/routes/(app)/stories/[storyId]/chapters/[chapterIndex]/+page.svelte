<script lang="ts">
  import type { PageProps } from './$types'
  import { untrack } from 'svelte'
  import { goto } from '$app/navigation'
  import { toast } from 'svelte-sonner'
  import * as Sentry from '@sentry/sveltekit'
  import { formatDistanceToNow } from 'date-fns'
  import SvelteMarkdown from '@humanspeak/svelte-markdown'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import {
    CalendarIcon,
    ChevronDownIcon,
    EllipsisVerticalIcon,
    FlagIcon,
    MessageCircleIcon,
    PencilIcon,
    Trash2Icon,
  } from '@lucide/svelte'

  import { STORAGE_KEY, VIEW_DEDUP_WINDOW_SECONDS } from '$lib/constants'
  import { useSession } from '$lib/client'
  import { track } from '$lib/analytics'
  import { Helmet } from '$lib/components/helmet'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { buttonVariants } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import { Prose } from '$lib/components/prose'
  import { LikeButton } from '$lib/components/like-button'
  import { ShareWidget } from '$lib/components/sharing'
  import { Narration } from '$lib/components/narration'
  import { BookmarkButton } from '$lib/components/bookmarks'
  import { CommentsSection } from '$lib/components/comments'
  import { ReportChapter } from '$lib/components/reporting'
  import { CustomHeading } from '$lib/components/markdown-overrides/custom-heading'

  let { data }: PageProps = $props()

  let openReportDialog = $state(false)

  const session = useSession()

  const client = useQueryClient()

  // svelte-ignore state_referenced_locally
  const timestamp = formatDistanceToNow(new Date(data.chapter.createdAt)) + ' ago'

  let likesCount = $derived(data.story.likeCount)
  let like = $derived(Boolean(data.story.likes.length > 0))

  const deleteChapter = async (): Promise<any> => {
    const res = await fetch(`/api/chapters/${data.chapter.id}/delete`, { method: 'DELETE' })

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  let deleteChapterMutation = createMutation(() => ({
    mutationFn: deleteChapter,
    onMutate: async () => {
      await client.cancelQueries()

      return
    },
    onSuccess: () => {
      toast('Chapter Deleted', {
        description: `The chapter has been deleted.`,
      })
      goto(`/stories/${data.story?.id}`)
    },
    onError: (error) => {
      toast('Error Deleting Chapter', {
        description: `There was an error deleting the chapter.`,
      })
      Sentry.captureException(error)
    },
    onSettled: () => {
      track('delete_chapter')
      client.invalidateQueries({ queryKey: ['user'] })
      client.invalidateQueries({ queryKey: ['new'] })
      client.invalidateQueries({ queryKey: ['hot'] })
      client.invalidateQueries({ queryKey: ['chapters'] })
    },
  }))

  let bookmarked = $derived(Boolean(data.chapter.bookmarks.length > 0))

  let chapterId = $derived(data.chapter.id)
  let cid = $derived(data.chapter.id)
  let sid = $derived(data.story.id)

  const recordViewMutation = createMutation(() => ({
    mutationFn: async ({ cid, sid }: { cid: string; sid: string }) => {
      const viewed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, number>
      const cutoff = Date.now() - VIEW_DEDUP_WINDOW_SECONDS * 1000

      for (const [id, timestamp] of Object.entries(viewed)) {
        if (timestamp < cutoff) delete viewed[id]
      }

      const response = await fetch('/api/analytics/views/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid, sid, viewed }),
      })

      viewed[cid] = Date.now()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed))

      return response.json()
    },
  }))

  $effect(() => {
    if (cid && sid) {
      untrack(() => {
        recordViewMutation.mutate({ cid, sid })
      })
    }
  })
</script>

<Helmet title={`Chapter ${data.chapter.chapterIndex} | ${data.story.title} | fancanon`} />
<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="relative min-h-screen w-full">
  <!-- Hero -->
  <header class="mx-auto w-full max-w-screen-lg space-y-5 px-3 py-10">
    <div class="flex items-center gap-2">
      <Breadcrumb.Root class="grow">
        <Breadcrumb.List>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Breadcrumb.Item>
                <Breadcrumb.Link href={`/stories/${data.story.id}`}>
                  {data.story.title.length <= 12
                    ? data.story.title
                    : `${data.story.title.slice(0, 12)}...`}
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>{data.story.title}</p>
            </Tooltip.Content>
          </Tooltip.Root>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Chapter {data.chapter.chapterIndex}</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="flex items-center gap-2">
        <!-- Like Button -->
        <LikeButton
          class={buttonVariants({
            variant: like ? 'secondary' : 'ghost',
            size: 'sm',
            class: 'rounded-full',
          })}
          storyTitle={data.story.title}
          storyId={data.story.id}
          user={$session.data?.user}
          bind:like
          bind:likesCount
        >
          {likesCount > 0 ? likesCount : ''}
        </LikeButton>

        <ShareWidget path={`/stories/${data.story.id}/chapters/${data.chapter.chapterIndex}`} />

        <Tooltip.Root>
          <Tooltip.Trigger>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                class={buttonVariants({ variant: 'ghost', size: 'icon-lg', class: 'rounded-full' })}
              >
                <EllipsisVerticalIcon class="size-4" />
                <span class="sr-only">Options</span>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content class="w-full">
                <DropdownMenu.Group>
                  {#if $session?.data?.user?.id === data.chapter.authorId}
                    <DropdownMenu.Item>
                      <a
                        href={`/stories/${data.story.id}/chapters/${data.chapter.chapterIndex}/edit`}
                        class="flex w-full items-center gap-2"
                      >
                        <PencilIcon class="mr-2 size-4" />
                        <span>Edit</span>
                      </a>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      class="cursor-pointer"
                      variant="destructive"
                      disabled={deleteChapterMutation.isPending}
                      onclick={(event) => {
                        const confirmDelete = confirm(
                          'Are you sure you want to delete this Chapter? Once deleted it cannont be recovered.',
                        )

                        if (confirmDelete) {
                          deleteChapterMutation.mutate()
                        } else {
                          event.preventDefault()
                        }
                      }}
                    >
                      <Trash2Icon class="mr-2" />
                      <span>Delete</span>
                    </DropdownMenu.Item>
                  {:else}
                    <DropdownMenu.Item
                      class="cursor-pointer"
                      variant="destructive"
                      onclick={() => (openReportDialog = !openReportDialog)}
                    >
                      <FlagIcon class="mr-2" />
                      <span>Report</span>
                    </DropdownMenu.Item>
                  {/if}
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Tooltip.Trigger>

          <Tooltip.Content>
            <p>Options</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-md space-y-3">
      <h1 class="font-heading text-3xl md:text-5xl">
        {data.chapter.title.length ? data.chapter.title : `Chapter ${data.chapter.chapterIndex}`}
      </h1>

      <div class="flex items-center gap-2">
        <a href={`/user/${data.chapter.author.username}`}>
          <Avatar.Root class="size-5 border">
            <Avatar.Image src={data.chapter.author.image ?? ''} alt={data.chapter.author.name} />
            <Avatar.Fallback>{data.chapter.author.name[0]}</Avatar.Fallback>
            <span class="sr-only">{data.chapter.author.name}</span>
          </Avatar.Root>
        </a>
        <p class="font-mono text-sm">
          <a
            class="tracking-wider text-primary underline-offset-4 hover:text-muted-foreground hover:underline"
            href={`/user/${data.chapter.author.username}`}
          >
            @{data.chapter.author.username}
          </a>
        </p>
        &bull;
        <CalendarIcon class="size-4 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  </header>

  <!-- Content -->
  <div>
    <!-- Toolbar -->
    <div class="sticky top-0 z-30 space-y-5 bg-background">
      <div class="border-b py-3">
        <div
          class="mx-auto flex w-full max-w-screen-md items-center justify-between px-3 font-mono text-sm font-semibold"
        >
          <DropdownMenu.Root>
            <DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Chapter {data.chapter.chapterIndex}
              <ChevronDownIcon />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              <DropdownMenu.Group>
                <DropdownMenu.Label>Select Chapter</DropdownMenu.Label>

                <DropdownMenu.Separator />

                {#each data.story.chapters as chapter, idx (idx)}
                  {#if chapter.chapterIndex === data.chapter.chapterIndex}
                    <DropdownMenu.Item disabled>
                      Chapter {chapter.chapterIndex}
                    </DropdownMenu.Item>
                  {:else}
                    <DropdownMenu.Item>
                      <a
                        href={`/stories/${data.story.id}/chapters/${chapter.chapterIndex}`}
                        class="flex w-full items-center gap-2"
                      >
                        Chapter {chapter.chapterIndex}
                      </a>
                    </DropdownMenu.Item>
                  {/if}
                {/each}
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <div class="flex space-x-2">
            <Narration text={data.chapter.content} language={data.story.language} />

            <Tooltip.Root>
              <Tooltip.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
                <a href="#comments">
                  <MessageCircleIcon />
                  <span class="sr-only">Jump to Comments</span>
                </a>
              </Tooltip.Trigger>

              <Tooltip.Content><p>Jump to Comments</p></Tooltip.Content>
            </Tooltip.Root>

            <BookmarkButton
              class={buttonVariants({
                variant: bookmarked ? 'secondary' : 'outline',
                size: 'icon',
              })}
              storyId={data.story.id}
              storyTitle={data.story.title}
              chapterId={data.chapter.id}
              chapterTitle={data.chapter.title.length
                ? data.chapter.title
                : `Chapter ${data.chapter.chapterIndex}`}
              user={$session?.data?.user}
              bind:bookmarked
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Chapter -->
    <div class="mx-auto w-full max-w-screen-md space-y-5 px-3 py-5">
      <Prose>
        <SvelteMarkdown source={data.chapter.content} renderers={{ heading: CustomHeading }} />
      </Prose>

      <div class="flex items-center justify-center gap-2">
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
            {like ? 'Unlike' : 'Like'}
          {:else}
            {#if like}
              <span class="flex h-5 items-center gap-2"
                >Unlike <Separator orientation="vertical" /> {likesCount}</span
              >
            {:else}
              <span class="flex h-5 items-center gap-2"
                >Like <Separator orientation="vertical" /> {likesCount}</span
              >
            {/if}
          {/if}
        </LikeButton>

        <ShareWidget path={`/stories/${data.story.id}/chapters/${data.chapter.chapterIndex}`} />
      </div>
    </div>
  </div>

  <!-- Comments -->
  <CommentsSection {chapterId} />
</div>

<ReportChapter
  storyId={data.story.id}
  chapterId={data.chapter.id}
  open={openReportDialog}
  onOpenChange={() => (openReportDialog = !openReportDialog)}
/>
