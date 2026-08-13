<script lang="ts">
  import { DotIcon } from '@lucide/svelte'

  import { Skeleton } from '$lib/components/ui/skeleton'
  import { Separator } from '$lib/components/ui/separator'
</script>

<div class="border-b border-dashed bg-card p-5 first:border-t last:border-none">
  <div class="mb-4 flex items-center">
    <Skeleton class="h-4 w-26" />
    <DotIcon />
    <Skeleton class="h-4 w-16" />
  </div>

  <Skeleton class="mb-6 h-4 w-2/5" />

  <Skeleton class="mb-4 h-6 w-2/3" />

  <div class="flex h-4 items-center gap-2 text-sm">
    <Skeleton class="size-4 rounded-full" />
    <Skeleton class="h-4 w-16" />
    <Separator orientation="vertical" class="h-4" />
    <Skeleton class="size-4 rounded-full" />
    <Skeleton class="h-4 w-16" />
  </div>
</div>
