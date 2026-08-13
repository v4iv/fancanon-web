<script lang="ts">
  import { Badge } from '$lib/components/ui/badge'

  interface Props {
    completed: boolean
  }

  const { completed }: Props = $props()
</script>

<Badge variant={completed ? 'outline' : 'default'}>
  {#if completed}
    Completed
  {:else}
    Ongoing
  {/if}
</Badge>
