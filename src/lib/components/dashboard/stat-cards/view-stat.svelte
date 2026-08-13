<script lang="ts">
  import { numify } from 'numify'
  import { EyeIcon, TrendingUpIcon } from '@lucide/svelte'

  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'

  interface Props {
    count: number
    storyCount: number
  }

  const { count, storyCount }: Props = $props()
</script>

<Card.Root>
  <Card.Header>
    <Card.Description class="flex w-full items-center justify-between">
      <span>Total Views</span>
      <Badge variant="outline">{storyCount} stories</Badge>
    </Card.Description>

    <Card.Title class="flex items-center gap-2 text-4xl"><EyeIcon /> {numify(count)}</Card.Title>
  </Card.Header>

  <Card.Footer>
    <div class="space-y-3">
      <p class="flex items-center gap-2 font-semibold">
        Average Readers Per Story <TrendingUpIcon class="size-4" />
      </p>
      <p class="text-muted-foreground">
        {Math.round(count / (storyCount || 1))} views per published story
      </p>
    </div>
  </Card.Footer>
</Card.Root>
