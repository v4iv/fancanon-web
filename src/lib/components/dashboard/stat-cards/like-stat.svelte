<script lang="ts">
  import { numify } from 'numify'
  import { HandHeartIcon, HeartIcon } from '@lucide/svelte'

  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'

  interface Props {
    count: number
    viewCount: number
  }

  const { count, viewCount }: Props = $props()
</script>

<Card.Root>
  <Card.Header>
    <Card.Description class="flex w-full items-center justify-between">
      <span>Total Likes</span>
      <Badge variant="outline">{viewCount} views</Badge>
    </Card.Description>

    <Card.Title class="flex items-center gap-2 text-4xl"><HeartIcon /> {numify(count)}</Card.Title>
  </Card.Header>

  <Card.Footer>
    <div class="space-y-3">
      <p class="flex items-center gap-2 font-semibold">
        Like-to-View Conversion <HandHeartIcon class="size-4" />
      </p>
      <p class="text-muted-foreground">
        ~1 like for every {Math.round(viewCount / (count || 1))} views
      </p>
    </div>
  </Card.Footer>
</Card.Root>
