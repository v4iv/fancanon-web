<script lang="ts">
  import { goto, invalidate } from '$app/navigation'
  import { toast } from 'svelte-sonner'
  import { numify } from 'numify'
  import { formatDistanceToNow } from 'date-fns'
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query'
  import {
    BookmarkIcon,
    BookOpenIcon,
    CalendarIcon,
    CircleAlertIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    FlagIcon,
    PencilIcon,
    PlusIcon,
    Trash2Icon,
  } from '@lucide/svelte'
  import { BASE_API_URL } from '$app/env/public'
  import { captureException } from '@sentry/sveltekit'

  import { track } from '$lib/analytics'
  import { DEFAULT_LIMIT } from '$lib/constants'
  import { m } from '$lib/paraglide/messages.js'
  import * as Alert from '$lib/components/ui/alert'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Item from '$lib/components/ui/item'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { Separator } from '$lib/components/ui/separator'
  import { ShareWidget } from '$lib/components/sharing'
  import { ReportChapter } from '$lib/components/reporting'

  interface Props {
    isAuthor: boolean
    storyId: string
  }

  let { storyId, isAuthor }: Props = $props()

  let openReportDialog = $state(false)

  const client = useQueryClient()

  const fetchChapters = async (): Promise<any> => {
    const res = await fetch(`${BASE_API_URL}/v1/stories/${storyId}/chapters`, {
      credentials: 'include',
    })

    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    return res.json()
  }

  const deleteChapter = async (chapterId: string): Promise<any> => {
    const res = await fetch(`${BASE_API_URL}/v1/chapters/${chapterId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

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
      invalidate(`/stories/${storyId}`)
    },
  }))

  const query = createQuery(() => ({
    queryKey: ['chapters', storyId],
    queryFn: fetchChapters,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  }))
</script>

<div class="mx-auto w-full max-w-screen-lg space-y-3 px-3 pb-5">
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
      <Skeleton class="h-18 w-full rounded-xl" />
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
          <div class="relative w-full">
            <Item.Root variant="outline">
              {#snippet child({ props })}
                <a href={`/stories/${storyId}/chapters/${chapter.chapterIndex}`} {...props}>
                  <Item.Content>
                    <Item.Title class="text-lg">
                      <div>
                        <span class="font-bold"
                          >{m['story.chapter-index']({ index: chapter.chapterIndex })}</span
                        >
                        <span>
                          {chapter.title.length ? `: ${chapter.title}` : ''}
                        </span>
                      </div>
                    </Item.Title>

                    <Item.Description class="flex h-4 items-center gap-2 text-xs">
                      <EyeIcon class="size-3" />

                      <span>
                        {m['story.views']({
                          count: numify(chapter.viewCount),
                        })}
                      </span>

                      <Separator orientation="vertical" />

                      <CalendarIcon class="size-3" />

                      <span>
                        {formatDistanceToNow(new Date(chapter.createdAt)) + ' ago'}
                      </span>
                    </Item.Description>
                  </Item.Content>

                  <Item.Actions>
                    <ShareWidget path={`/stories/${storyId}/chapters/${chapter.chapterIndex}`} />

                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger
                            class={buttonVariants({
                              variant: 'ghost',
                              size: 'icon-lg',
                              class: 'rounded-full',
                            })}
                            onclick={(event) => {
                              event.stopPropagation()
                              event.preventDefault()
                            }}
                          >
                            <EllipsisVerticalIcon class="size-4" />
                            <span class="sr-only">{m['story.more-options']()}</span>
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
                  </Item.Actions>
                </a>
              {/snippet}
            </Item.Root>
            {#if chapter.bookmarks.length > 0}
              <BookmarkIcon
                class="absolute -top-1 right-0 z-20 size-4 fill-primary stroke-primary"
              />
            {/if}

            <ReportChapter
              {storyId}
              chapterId={chapter.id}
              open={openReportDialog}
              onOpenChange={() => (openReportDialog = !openReportDialog)}
            />
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
