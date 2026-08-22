<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Separator } from '$lib/components/ui/separator'
  import { Skeleton } from '$lib/components/ui/skeleton'
</script>

<Card.Root class="w-full">
  <Card.Header>
    <div class="flex items-center justify-between">
      <div class="mb-2 flex items-center gap-2">
        <!-- Content Rating -->
        <Skeleton class="h-5 w-18 rounded-full" />
        <!-- Completion Status -->
        <Skeleton class="h-5 w-20 rounded-full" />
        <!-- Language -->
        <Skeleton class="h-5 w-16 rounded-full" />
      </div>
      <!-- More Options -->
      <Skeleton class="h-8 w-8 rounded-full" />
    </div>

    <!-- Title -->
    <Card.Title><Skeleton class="mt-3 mb-2 h-8 w-3/5" /></Card.Title>

    <!-- User and Publish Date -->
    <div class="mt-2 flex h-4 items-center gap-2">
      <Skeleton class="h-4 w-4 rounded-full" />
      <Skeleton class="h-4 w-20" />
      <Separator orientation="vertical" class="h-4" />
      <Skeleton class="size-4 rounded-full" />
      <Skeleton class="h-4 w-16" />
    </div>

    <!-- Fandoms -->
    <div class="mt-2 flex flex-wrap items-center gap-2">
      <Skeleton class="h-7 w-24 rounded-full" />
      <Skeleton class="h-7 w-24 rounded-full" />
    </div>
  </Card.Header>

  <Card.Content>
    <!-- Description -->
    <div class="space-y-2.5">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-1/2" />
    </div>

    <!-- Tags -->
    <div class="mt-8 flex flex-wrap gap-x-4 gap-y-2">
      <Skeleton class="h-4 w-28" />
      <Skeleton class="h-4 w-32" />
      <Skeleton class="h-4 w-24" />
      <Skeleton class="h-4 w-20" />
      <Skeleton class="h-4 w-16" />
      <Skeleton class="h-4 w-16" />
    </div>
  </Card.Content>

  <Card.Footer class="items-center justify-between">
    <!-- Chapters -->
    <div class="flex items-center gap-1">
      <!-- chapter Count -->
      <Skeleton class="h-7 w-10 rounded-full" />
      <!-- view Count -->
      <Skeleton class="h-7 w-10 rounded-full" />
      <!-- comment Count -->
      <Skeleton class="h-7 w-10 rounded-full" />
    </div>

    <div class="flex items-center gap-2">
      <!-- Like Button -->
      <Skeleton class="h-7 w-10 rounded-full" />
      <!-- Read Later Button -->
      <Skeleton class="h-7 w-24 rounded-full" />
    </div>
  </Card.Footer>
</Card.Root>
