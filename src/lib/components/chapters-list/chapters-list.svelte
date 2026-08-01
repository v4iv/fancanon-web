<script lang="ts">
  import { goto, invalidate } from '$app/navigation'
  import { toast } from 'svelte-sonner'
  import { formatDistanceToNow } from 'date-fns'
  import { captureException } from '@sentry/sveltekit'
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query'
  import {
    BookmarkIcon,
    BookOpenIcon,
    CalendarIcon,
    CircleAlertIcon,
    EllipsisVerticalIcon,
    FlagIcon,
    PencilIcon,
    PlusIcon,
    Trash2Icon,
  } from '@lucide/svelte'

  import { track } from '$lib/analytics'
  import { DEFAULT_LIMIT } from '$lib/constants'
  import { m } from '$lib/paraglide/messages.js'
  import * as Alert from '$lib/components/ui/alert'
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { ShareWidget } from '$lib/components/sharing'
  // import { ReportChapter } from '$lib/components/reporting'

  interface Props {
    isAuthor: boolean
    storyId: string
  }

  let { storyId, isAuthor }: Props = $props()

  let openReportDialog = $state(false)

  const client = useQueryClient()

  const fetchChapters = async (): Promise<any> => {
    const res = await fetch(`/api/stories/${storyId}/chapters`)

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const deleteChapter = async (chapterId: string): Promise<any> => {
    const res = await fetch(`/api/chapters/${chapterId}/delete`, { method: 'DELETE' })

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const deleteChapterMutation = createMutation(() => ({
    mutationFn: (chapterId: string) => deleteChapter(chapterId),
    onMutate: async () => {
      await client.cancelQueries()

      return
    },
    onSuccess: () => {
      toast('Chapter Deleted', {
        description: `The chapter has been deleted.`,
      })
      goto(`/stories/${storyId}`)
    },
    onError: (error) => {
      toast('Error Deleting Chapter', {
        description: `There was an error deleting the chapter.`,
      })
      captureException(error)
    },
    onSettled: () => {
      track('delete_chapter')
      client.invalidateQueries({ queryKey: ['chapters', storyId] })
      invalidate(`/api/stories/${storyId}`)
    },
  }))

  const query = createQuery(() => ({
    queryKey: ['chapters', storyId],
    queryFn: fetchChapters,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // avoid reshuffling an in-progress infinite scroll
  }))
</script>

<div class="mx-auto w-full max-w-screen-lg space-y-3 px-2 pb-5">
  {#if query.status === 'error'}
    <Alert.Root variant="destructive" class="border-destructive">
      <CircleAlertIcon />

      <Alert.Title>{m['story.chapter-error-heading']()}</Alert.Title>

      <Alert.Description>
        <p>{m['story.chapter-error-subheading']()}</p>
      </Alert.Description>
    </Alert.Root>
  {:else if query.status === 'pending'}
    {#each Array(DEFAULT_LIMIT) as _, idx (idx)}
      <Skeleton class="h-25 w-full rounded-xl" />
    {/each}
  {:else if query.status === 'success'}
    {#if query.data.chapters}
      {#if query.data.chapters.length === 0}
        <div class="py-12 text-center">
          <BookOpenIcon class="mx-auto mb-4 size-12 text-muted-foreground" />

          <p class="mb-2 text-lg font-semibold">{m['story.chapter-empty-heading']()}</p>

          <p class="text-muted-foreground">{m['story.chapter-empty-subheading']()}</p>
        </div>
      {:else}
        {#each query.data.chapters as chapter, idx (idx)}
          <div
            role="button"
            tabindex="0"
            class="relative cursor-pointer rounded-xl border bg-card p-5 text-card-foreground transition-shadow duration-200 hover:bg-muted/50 hover:shadow-md dark:hover:bg-input/30"
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                goto(`/stories/${storyId}/chapters/${chapter.chapterIndex}`)
              }
            }}
            onclick={() => goto(`/stories/${storyId}/chapters/${chapter.chapterIndex}`)}
          >
            <div class="flex items-center">
              <div class="grow space-y-2">
                <div>
                  <span class="font-bold"
                    >{m['story.chapter-index']({ index: chapter.chapterIndex })}</span
                  >
                  <span>
                    {chapter.title.length ? `: ${chapter.title}` : ''}
                  </span>
                </div>

                <!-- Publish Date -->
                <div class="mb-2 flex h-4 items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon class="size-4" />

                  <span>
                    {formatDistanceToNow(new Date(chapter.createdAt)) + ' ago'}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <ShareWidget path={`/stories/${storyId}/chapters/${chapter.chapterIndex}`} />

                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        {#snippet child({ props })}
                          <Button
                            {...props}
                            variant="ghost"
                            size="icon-lg"
                            class="rounded-full"
                            onclick={(event) => {
                              event.stopPropagation()
                              event.preventDefault()
                            }}
                          >
                            <EllipsisVerticalIcon class="size-4" />
                            <span class="sr-only">{m['story.more-options']()}</span>
                          </Button>
                        {/snippet}
                      </DropdownMenu.Trigger>

                      <DropdownMenu.Content>
                        <DropdownMenu.Group>
                          {#if isAuthor}
                            <DropdownMenu.Item>
                              <a
                                href={`/stories/${storyId}/chapters/${chapter.chapterIndex}/edit`}
                                class="flex w-full items-center gap-2"
                              >
                                <PencilIcon class="mr-2 size-4" />
                                <span>{m['story.edit']()}</span>
                              </a>
                            </DropdownMenu.Item>

                            <DropdownMenu.Item
                              class="cursor-pointer"
                              variant="destructive"
                              disabled={deleteChapterMutation.isPending}
                              onclick={(event) => {
                                const confirmDelete = confirm(
                                  m['story.chapter-delete-confirmation'](),
                                )

                                if (confirmDelete) {
                                  deleteChapterMutation.mutate(chapter.id)
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
            {#if chapter.bookmarks.length > 0}
              <BookmarkIcon class="absolute -top-1 right-0 fill-primary stroke-primary" />
            {/if}

            <!-- <ReportChapter -->
            <!--   {storyId} -->
            <!--   chapterId={chapter.id} -->
            <!--   open={openReportDialog} -->
            <!--   onOpenChange={() => (openReportDialog = !openReportDialog)} -->
            <!-- /> -->
          </div>
        {/each}
      {/if}
    {/if}
  {/if}

  <div class="flex justify-end">
    {#if isAuthor}
      <Button href={`/stories/${storyId}/chapters/new`}>
        <PlusIcon />
        {m['story.add-chapter']()}
      </Button>
    {/if}
  </div>
</div>
