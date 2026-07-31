<script lang="ts">
  import { FunnelIcon } from '@lucide/svelte'

  import { ContentRating, Languages } from '$lib/constants'
  import { m } from '$lib/paraglide/messages.js'
  import * as Select from '$lib/components/ui/select'
  import * as Popover from '$lib/components/ui/popover'
  import * as RadioGroup from '$lib/components/ui/radio-group'
  import { buttonVariants } from '$lib/components/ui/button'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import { Label } from '$lib/components/ui/label'
  import { Separator } from '$lib/components/ui/separator'

  interface Props {
    limit: number
    sort: string
    selectedLanguages: string[]
    selectedContentRatings: string[]
    completion: string
    updateURL: (updates: Record<string, string | string[] | null>) => void
  }

  let {
    limit = $bindable(),
    sort = $bindable(),
    selectedLanguages = $bindable(),
    selectedContentRatings = $bindable(),
    completion = $bindable(),
    updateURL,
  }: Props = $props()

  // Available filter options
  const sortOptions = [
    { value: 'hot', label: m['feed.hot']() },
    { value: 'new', label: m['feed.new']() },
    { value: 'old', label: m['feed.old']() },
  ]
  const completionOptions = [
    { value: 'any', label: m['feed.any']() },
    { value: 'completed', label: m['feed.completed']() },
    { value: 'ongoing', label: m['feed.ongoing']() },
  ]

  const sortTriggerContent = $derived(sortOptions.find((o) => o.value === sort)?.label)

  function toggleContentRating(rating: string) {
    const newRatings = selectedContentRatings.includes(rating)
      ? selectedContentRatings.filter((r: string) => r !== rating)
      : [...selectedContentRatings, rating]

    updateURL({ contentRating: newRatings })
  }

  function updateCompletion(newCompletion: string) {
    updateURL({ completion: newCompletion })
  }

  function toggleLanguage(language: string) {
    const newLanguages = selectedLanguages.includes(language)
      ? selectedLanguages.filter((l: string) => l !== language)
      : [...selectedLanguages, language]

    updateURL({ languages: newLanguages })
  }
</script>

<div class="sticky top-0 border-y border-dashed bg-background">
  <div class="mx-auto w-full max-w-screen-lg px-2 py-3">
    <div class="flex items-center justify-between">
      <!-- Sort By -->
      <div class="flex items-center gap-2">
        <Label for="sort" class="text-sm text-muted-foreground">{m['feed.sort-by']()}:</Label>
        <Select.Root
          type="single"
          onValueChange={(value) => {
            updateURL({ sort: value })
          }}
        >
          <Select.Trigger id="sort" class="w-20">
            {sortTriggerContent}
            <span class="sr-only">{m['feed.sort-by']()}</span>
          </Select.Trigger>

          <Select.Content>
            {#each sortOptions as sortOption, idx (idx)}
              <Select.Item value={sortOption.value}>
                {sortOption.label}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <!-- Filters -->
      <Popover.Root>
        <Popover.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
          <FunnelIcon class="size-4" />
          <span class="sr-only">{m['feed.filters']()}</span>
        </Popover.Trigger>

        <Popover.Content class="space-y-3 p-3">
          <!-- Content Ratings -->
          <div class="space-y-3">
            <p class="text-sm">{m['feed.content-ratings']()}</p>

            {#each Object.entries(ContentRating) as [value, label] (value)}
              {@const checked = Boolean(selectedContentRatings.includes(value))}
              <div class="flex items-center gap-3">
                <Checkbox {checked} onclick={() => toggleContentRating(value)} />
                <p class="text-sm">{label}</p>
              </div>
            {/each}
          </div>

          <Separator />

          <!-- Completion -->
          <div class="space-y-3">
            <p class="text-sm">{m['feed.completion-status']()}</p>

            <RadioGroup.Root value={completion}>
              {#each completionOptions as completionOption, idx (idx)}
                <div class="flex items-center space-x-2">
                  <RadioGroup.Item
                    id={completionOption.value}
                    value={completionOption.value}
                    onclick={() => updateCompletion(completionOption.value)}
                  />
                  <Label for={completionOption.value}>{completionOption.label}</Label>
                </div>
              {/each}
            </RadioGroup.Root>
          </div>

          <Separator />

          <!-- Languages -->
          <div class="space-y-3">
            <p class="text-sm">{m['feed.languages']()}</p>

            {#each Object.entries(Languages) as [value, label] (value)}
              {@const checked = Boolean(selectedLanguages.includes(label))}
              <div class="flex items-center gap-3">
                <Checkbox {checked} onclick={() => toggleLanguage(label)} />
                <p class="text-sm capitalize">{label}</p>
              </div>
            {/each}
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  </div>
</div>
