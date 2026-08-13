<script lang="ts">
  import { GripVerticalIcon, PlusIcon } from '@lucide/svelte'
  import {
    BlockHandleAdd,
    BlockHandleDraggable,
    BlockHandlePopup,
    BlockHandlePositioner,
    BlockHandleRoot,
  } from 'prosekit/svelte/block-handle'

  interface Props {
    dir?: 'ltr' | 'rtl'
  }

  const props: Props = $props()
</script>

<BlockHandleRoot>
  <BlockHandlePositioner
    placement={props.dir === 'rtl' ? 'right' : 'left'}
    class="z-50 block h-min w-min overflow-visible transition-transform duration-100 ease-out motion-reduce:transition-none"
  >
    <BlockHandlePopup
      class="box-border flex origin-(--transform-origin) transition-[opacity,scale] transition-discrete duration-100 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 motion-reduce:transition-none starting:scale-95 starting:opacity-0"
    >
      <BlockHandleAdd
        class="box-border flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm text-gray-500/50 hover:bg-gray-100 dark:text-gray-400/50 dark:hover:bg-gray-800"
      >
        <PlusIcon />
      </BlockHandleAdd>
      <BlockHandleDraggable
        class="box-border flex h-6 w-5 cursor-grab items-center justify-center rounded-sm text-gray-500/50 hover:bg-gray-100 dark:text-gray-400/50 dark:hover:bg-gray-800"
      >
        <GripVerticalIcon />
      </BlockHandleDraggable>
    </BlockHandlePopup>
  </BlockHandlePositioner>
</BlockHandleRoot>
