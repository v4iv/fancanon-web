<script lang="ts">
  import { goto } from '$app/navigation'
  import { toast } from 'svelte-sonner'
  import { isHttpError } from '@sveltejs/kit'
  import * as Sentry from '@sentry/sveltekit'
  import { useQueryClient } from '@tanstack/svelte-query'
  import { ArrowUpRightIcon, CircleIcon, UserLockIcon } from '@lucide/svelte'

  import { track } from '$lib/analytics'
  import { addNewComment as form } from '$lib/remote/comment/data.remote'
  import * as InputGroup from '$lib/components/ui/input-group'
  import { Separator } from '$lib/components/ui/separator'
  import { schema } from '$lib/components/forms/comment-form'

  interface Props {
    user?: any
    chapterId: string
    parentId?: string
    submitText?: string
    placeholder?: string
    startReply?: boolean
  }

  let {
    user,
    chapterId,
    parentId = undefined,
    submitText = 'Comment',
    // eslint-disable-next-line no-useless-assignment
    startReply = $bindable(false),
    placeholder = 'Share your thoughts...',
  }: Props = $props()

  const client = useQueryClient()

  let commentForm = $derived.by(() => {
    if (parentId) return form.for(parentId)
    else return form.for(chapterId)
  })

  let { enhance, fields, preflight } = $derived(commentForm)

  let submitting = $state(false)
</script>

<form
  class="space-y-3"
  {...preflight(schema)}
  {...enhance(async ({ element, submit }: any) => {
    try {
      submitting = true

      const res = await submit()

      if (res) {
        track('comment', {
          isReply: !!parentId,
        })
        element.reset()
        submitting = false
        startReply = false
        client.invalidateQueries({ queryKey: ['comments', chapterId] })
        toast.success('Success')
      }
    } catch (err) {
      Sentry.captureException(err)

      if (isHttpError(err)) {
        toast.error('Error!', { description: err.body.message })
      } else {
        toast.error('Error!', { description: 'Something, went wrong.' })
      }
    } finally {
      submitting = false
    }
  })}
>
  <InputGroup.Root>
    <!-- Hidden Fields	 -->
    {#if parentId}
      <input id="parentId" {...fields.parentId.as('hidden', parentId)} />
    {/if}

    <input id="chapterId" {...fields.chapterId.as('hidden', chapterId)} />

    <InputGroup.Textarea
      id="content"
      {placeholder}
      {...fields.content.as('text')}
      disabled={!user || submitting}
      required
    />

    <InputGroup.Addon align="block-end">
      {#if !user}
        <InputGroup.Text class="ms-auto">Sign In To Comment</InputGroup.Text>

        <Separator orientation="vertical" class="!h-4" />

        <InputGroup.Button
          type="button"
          variant="default"
          class="rounded-full"
          size="icon-xs"
          onclick={(e) => {
            e.preventDefault()
            goto(`/auth/sign-in?redirect=${encodeURIComponent(window.location?.pathname)}`)
          }}
        >
          <UserLockIcon />
          <span class="sr-only">Sign In</span>
        </InputGroup.Button>
      {:else}
        <InputGroup.Text class="ms-auto text-xs text-destructive">
          {#each fields.content.issues() as issue, idx (idx)}
            {issue.message}&nbsp;
          {/each}
        </InputGroup.Text>

        <Separator orientation="vertical" class="!h-4" />

        <InputGroup.Button
          type="submit"
          variant="default"
          class="rounded-full"
          size="icon-xs"
          disabled={submitting || !user}
        >
          {#if submitting}
            <CircleIcon class="animate-ping" />
          {:else}
            <ArrowUpRightIcon />
          {/if}
          <span class="sr-only">{submitText}</span>
        </InputGroup.Button>
      {/if}
    </InputGroup.Addon>
  </InputGroup.Root>
</form>
