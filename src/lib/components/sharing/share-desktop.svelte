<script lang="ts">
  import { ORIGIN } from '$app/env/public'
  import { toast } from 'svelte-sonner'
  import { LinkIcon, Share2Icon } from '@lucide/svelte'

  import { track } from '$lib/analytics'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Bluesky, Facebook, Reddit, Whatsapp } from '$lib/components/brand-icons'

  interface Props {
    path: string
    title?: string
  }

  let { path, title = 'Fancanon' }: Props = $props()

  // svelte-ignore state_referenced_locally
  const link = `${ORIGIN}${path}`
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={buttonVariants({
      variant: 'ghost',
      size: 'icon-lg',
      className: 'rounded-full text-primary',
    })}
    onclick={(event) => {
      event.stopPropagation()
      event.preventDefault()
      track('shared_desktop', {
        link,
      })
    }}
  >
    <Share2Icon />
    <span class="sr-only">Share</span>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content class="w-full">
    <DropdownMenu.Group>
      <DropdownMenu.Item>
        <a
          class="flex w-full items-center gap-2"
          href={`https://bsky.app/intent/compose?text=${encodeURIComponent(link)}`}
        >
          <Bluesky className="size-4 fill-[#0285FF]" />Share on Bluesky
        </a>
      </DropdownMenu.Item>

      <DropdownMenu.Item>
        <a
          class="flex w-full items-center gap-2"
          href={`http://www.reddit.com/submit?url=${link}&title=${title}`}
        >
          <Reddit className="size-4 fill-[#FF4500]" />Share on Reddit
        </a>
      </DropdownMenu.Item>

      <DropdownMenu.Item>
        <a
          class="flex w-full items-center gap-2"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`}
        >
          <Facebook className="size-4 text-[#0866FF]" />Share on Facebook
        </a>
      </DropdownMenu.Item>

      <DropdownMenu.Item>
        <a
          class="flex w-full items-center gap-2"
          href={`https://wa.me/?text=${encodeURIComponent(link)}`}
        >
          <Whatsapp className="size-4 fill-[#25D366]" />Share on WhatsApp
        </a>
      </DropdownMenu.Item>
    </DropdownMenu.Group>

    <DropdownMenu.Separator />

    <DropdownMenu.Group>
      <DropdownMenu.Item
        onclick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          navigator.clipboard.writeText(link)
          toast('Link copied to clipboard')
        }}
      >
        <LinkIcon />
        Copy to Clipboard
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
