<script lang="ts">
  import { numify } from 'numify'
  import { ActivityIcon, BookMarkedIcon } from '@lucide/svelte'

  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'

  interface Props {
    count: number
    commentCount: number
  }

  const { count, commentCount }: Props = $props()
</script>

<Card.Root>
  <Card.Header>
    <Card.Description class="flex w-full items-center justify-between">
      <span>Total Read Laters</span>
      <Badge variant="outline">Bookmarked</Badge>
    </Card.Description>

    <Card.Title class="flex items-center gap-2 text-4xl">
      <BookMarkedIcon />
      {numify(count)}
    </Card.Title>
  </Card.Header>

  <Card.Footer>
    <div class="space-y-3">
      <p class="flex items-center gap-2 font-semibold">
        Engagement Density <ActivityIcon class="size-4" />
      </p>

      <p class="text-muted-foreground">
        {commentCount} reader comments across all chapters
      </p>
    </div>
  </Card.Footer>
</Card.Root>
