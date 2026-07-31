<script lang="ts">
  import { goto } from '$app/navigation'
  import { CircleAlert } from '@lucide/svelte'

  import { m } from '$lib/paraglide/messages.js'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Button, buttonVariants } from '$lib/components/ui/button'

  interface Props {
    path: string
    open: boolean
    title: string
    description?: string
    onOpenChange: () => boolean
  }

  let { title, description = '', path = '', open = $bindable(), onOpenChange }: Props = $props()
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>
        <span class="flex items-center gap-2">
          <CircleAlert class="text-red-600" />
          {title}
        </span>
      </Dialog.Title>

      <Dialog.Description>
        {description}
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}>
        {m['story.cancel']()}
      </Dialog.Close>

      <Button
        type="button"
        variant="default"
        onclick={() => {
          goto(path)
        }}
      >
        {m['story.proceed']()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
