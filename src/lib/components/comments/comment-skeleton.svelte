<script lang="ts">
  import { Skeleton } from '../ui/skeleton'

  let { depth = 0 }: { depth?: number } = $props()
</script>

<div class={`${depth > 0 ? 'ml-4 border-l-2 border-muted pl-4' : ''}`}>
  <div class="flex gap-3 py-3">
    <Skeleton class="size-8 rounded-full" />

    <div class="flex-1 space-y-2">
      <div class="flex items-center gap-2">
        <Skeleton class="h-4 w-20 rounded" />
        <Skeleton class="h-4 w-16" />
      </div>

      <div class="space-y-2">
        <Skeleton class="h-4 w-full rounded" />
        <Skeleton class="h-4 w-3/4 rounded" />
      </div>

      <div class="flex items-center gap-2">
        <Skeleton class="h-8 w-16 rounded-full" />
        <Skeleton class="h-8 w-16 rounded-full" />
        <Skeleton class="size-8 rounded-full" />
      </div>
    </div>
  </div>
</div>
