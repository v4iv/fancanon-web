<script lang="ts">
  import { ORIGIN } from '$app/env/public'
  import { Share2Icon } from '@lucide/svelte'

  import { track } from '$lib/analytics'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as Tooltip from '$lib/components/ui/tooltip'

  interface Props {
    path: string
    title?: string
  }

  let { path, title = 'Fancanon' }: Props = $props()

  // svelte-ignore state_referenced_locally
  const link = `${ORIGIN}${path}`
</script>

<Tooltip.Root>
  <Tooltip.Trigger
    class={buttonVariants({ variant: 'ghost', size: 'icon-lg', class: 'rounded-full' })}
    onclick={async (event) => {
      event.stopPropagation()
      event.preventDefault()
      track('shared_mobile', {
        link,
      })
      try {
        await navigator.share({ title, url: link })
      } catch (error) {
        console.log('Sharing Cancelled: ', error)
      }
    }}
  >
    <Share2Icon />
    <span class="sr-only">Share</span>
  </Tooltip.Trigger>

  <Tooltip.Content>
    <p>Share</p>
  </Tooltip.Content>
</Tooltip.Root>
