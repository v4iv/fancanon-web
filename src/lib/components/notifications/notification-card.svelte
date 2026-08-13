<script lang="ts">
  import type { Snippet } from 'svelte'
  import { formatDistanceToNow } from 'date-fns'

  import * as Item from '$lib/components/ui/item'
  import {
    BellIcon,
    HeartIcon,
    MessageCircleHeartIcon,
    MessageCirclePlusIcon,
    MessageCircleReplyIcon,
    UserPlusIcon,
  } from '@lucide/svelte'
  import { goto } from '$app/navigation'

  interface Props {
    verb: 'STORY_LIKED' | 'USER_FOLLOWED' | 'REPLY_POSTED' | 'COMMENT_LIKED' | 'COMMENT_POSTED'
    createdAt: string
    seenAt: string | null
    open: boolean
    link: string
    children: Snippet<[]>
  }

  // eslint-disable-next-line no-useless-assignment
  let { createdAt, seenAt, link, open = $bindable(), verb, children }: Props = $props()
</script>

<Item.Root variant={seenAt !== null ? 'muted' : 'outline'}>
  {#snippet child({ props })}
    <a
      href={link}
      onclick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        open = false
        goto(link)
      }}
      {...props}
    >
      <Item.Media variant="icon">
        {#if verb === 'STORY_LIKED'}
          <HeartIcon class="size-4" />
        {:else if verb === 'COMMENT_LIKED'}
          <MessageCircleHeartIcon class="size-4" />
        {:else if verb === 'COMMENT_POSTED'}
          <MessageCirclePlusIcon class="size-4" />
        {:else if verb === 'REPLY_POSTED'}
          <MessageCircleReplyIcon class="size-4" />
        {:else if verb === 'USER_FOLLOWED'}
          <UserPlusIcon class="size-4" />
        {:else}
          <BellIcon class="size-4" />
        {/if}
      </Item.Media>

      <Item.Content>
        <Item.Title class="font-sans font-light">
          {@render children()}
        </Item.Title>

        <Item.Description class="flex w-full items-center justify-end text-xs">
          {formatDistanceToNow(createdAt)} ago
        </Item.Description>
      </Item.Content>
    </a>
  {/snippet}
</Item.Root>
