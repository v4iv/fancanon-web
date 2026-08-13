<script lang="ts">
  import { goto } from '$app/navigation'

  import { NotificationCard } from '$lib/components/notifications'

  interface Props {
    activity: any
    open: boolean
  }

  let { activity, open = $bindable() }: Props = $props()

  function usernameLink(username: string) {
    return `/user/${username}`
  }
</script>

{#if activity.verb === 'STORY_LIKED'}
  {@const link = `/stories/${activity.story?.id}`}
  <NotificationCard
    bind:open
    {link}
    createdAt={activity.createdAt}
    seenAt={activity.seenAt}
    verb={activity.verb}
  >
    <p>
      {@render renderUsername(activity.actor.username)}&nbsp;liked your story
      <span class="font-serif font-semibold italic">{activity.story?.title}</span>.
    </p>
  </NotificationCard>
{:else if activity.verb === 'USER_FOLLOWED'}
  {@const link = usernameLink(activity.actor.username)}
  <NotificationCard
    bind:open
    {link}
    createdAt={activity.createdAt}
    seenAt={activity.seenAt}
    verb={activity.verb}
  >
    <p>
      {@render renderUsername(activity.actor.username)}&nbsp;started following you.
    </p>
  </NotificationCard>
{:else if activity.verb === 'REPLY_POSTED'}
  {@const link = `/stories/${activity.comment?.chapter.storyId}/chapters/${activity.chapter?.chapterIndex}#comments`}
  <NotificationCard
    bind:open
    {link}
    createdAt={activity.createdAt}
    seenAt={activity.seenAt}
    verb={activity.verb}
  >
    <p>
      {@render renderUsername(activity.actor.username)}&nbsp;replied to your comment.
    </p>
  </NotificationCard>
{:else if activity.verb === 'COMMENT_LIKED'}
  {@const link = `/stories/${activity.comment?.chapter.storyId}/chapters/${activity.chapter?.chapterIndex}#comments`}
  <NotificationCard
    bind:open
    {link}
    createdAt={activity.createdAt}
    seenAt={activity.seenAt}
    verb={activity.verb}
  >
    <p>
      {@render renderUsername(activity.actor.username)}&nbsp;liked your comment.
    </p>
  </NotificationCard>
{:else if activity.verb === 'COMMENT_POSTED'}
  {@const link = `/stories/${activity.comment?.chapter.storyId}/chapters/${activity.chapter?.chapterIndex}#comments`}
  <NotificationCard
    bind:open
    {link}
    createdAt={activity.createdAt}
    seenAt={activity.seenAt}
    verb={activity.verb}
  >
    <p>
      {@render renderUsername(activity.actor.username)}&nbsp;commented on
      <span class="font-serif font-semibold">Chapter {activity.chapter.chapterIndex}</span>
      of
      <a
        href={`/stories/${activity.comment?.chapter.storyId}`}
        onclick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        class=" font-serif font-semibold italic underline-offset-4 hover:underline"
        >{activity.story?.title}</a
      >.
    </p>
  </NotificationCard>
{/if}

{#snippet renderUsername(username: string)}
  <a
    class="font-medium text-primary underline-offset-4 hover:text-muted-foreground hover:underline"
    href={usernameLink(username)}
    onclick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      open = false
      goto(usernameLink(username))
    }}
  >
    @{username}
  </a>
{/snippet}
