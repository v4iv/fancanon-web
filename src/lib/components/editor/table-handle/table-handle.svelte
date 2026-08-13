<script lang="ts">
  import { GripHorizontalIcon, GripVerticalIcon } from '@lucide/svelte'
  import type { Editor } from 'prosekit/core'
  import type { TableExtension } from 'prosekit/extensions/table'
  import { useEditorDerivedValue } from 'prosekit/svelte'
  import { MenuItem, MenuPopup, MenuPositioner } from 'prosekit/svelte/menu'
  import {
    TableHandleColumnMenuRoot,
    TableHandleColumnMenuTrigger,
    TableHandleColumnPopup,
    TableHandleColumnPositioner,
    TableHandleDragPreview,
    TableHandleDropIndicator,
    TableHandleRoot,
    TableHandleRowMenuRoot,
    TableHandleRowMenuTrigger,
    TableHandleRowPopup,
    TableHandleRowPositioner,
  } from 'prosekit/svelte/table-handle'

  function getTableHandleState(editor: Editor<TableExtension>) {
    return {
      addTableColumnBefore: {
        canExec: editor.commands.addTableColumnBefore.canExec(),
        command: () => editor.commands.addTableColumnBefore(),
      },
      addTableColumnAfter: {
        canExec: editor.commands.addTableColumnAfter.canExec(),
        command: () => editor.commands.addTableColumnAfter(),
      },
      deleteCellSelection: {
        canExec: editor.commands.deleteCellSelection.canExec(),
        command: () => editor.commands.deleteCellSelection(),
      },
      deleteTableColumn: {
        canExec: editor.commands.deleteTableColumn.canExec(),
        command: () => editor.commands.deleteTableColumn(),
      },
      addTableRowAbove: {
        canExec: editor.commands.addTableRowAbove.canExec(),
        command: () => editor.commands.addTableRowAbove(),
      },
      addTableRowBelow: {
        canExec: editor.commands.addTableRowBelow.canExec(),
        command: () => editor.commands.addTableRowBelow(),
      },
      deleteTableRow: {
        canExec: editor.commands.deleteTableRow.canExec(),
        command: () => editor.commands.deleteTableRow(),
      },
      deleteTable: {
        canExec: editor.commands.deleteTable.canExec(),
        command: () => editor.commands.deleteTable(),
      },
    }
  }

  interface Props {
    dir?: 'ltr' | 'rtl'
  }

  const props: Props = $props()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const state = useEditorDerivedValue(getTableHandleState)
</script>

<TableHandleRoot>
  <TableHandleDragPreview />
  <TableHandleDropIndicator />
  <TableHandleColumnPositioner
    class="z-50 block h-min w-min overflow-visible transition-transform duration-100 ease-out motion-reduce:transition-none"
  >
    <TableHandleColumnPopup
      class="box-border flex origin-(--transform-origin) translate-y-[50%] transition-[opacity,scale] transition-discrete duration-100 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 motion-reduce:transition-none starting:scale-95 starting:opacity-0"
    >
      <TableHandleColumnMenuRoot>
        <TableHandleColumnMenuTrigger
          class="box-border flex h-4.5 w-6 items-center justify-center overflow-clip rounded-sm border border-solid border-gray-200 bg-[canvas] p-0 text-gray-500/50 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400/50 dark:hover:bg-gray-800"
        >
          <GripHorizontalIcon class="min-size-5 block size-5" />
        </TableHandleColumnMenuTrigger>
        <MenuPositioner
          class="z-50 block h-min w-min overflow-visible transition-transform duration-100 ease-out motion-reduce:transition-none"
        >
          <MenuPopup
            class="relative box-border flex max-h-100 min-w-32 origin-(--transform-origin) flex-col overflow-auto rounded-xl border border-gray-200 bg-[canvas] p-1 whitespace-nowrap shadow-lg transition-[opacity,scale] transition-discrete duration-40 outline-none select-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 motion-reduce:transition-none dark:border-gray-800 starting:scale-95 starting:opacity-0"
          >
            {#if $state.addTableColumnBefore.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                onSelect={$state.addTableColumnBefore.command}
              >
                <span>Insert Left</span>
              </MenuItem>
            {/if}
            {#if $state.addTableColumnAfter.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                onSelect={$state.addTableColumnAfter.command}
              >
                <span>Insert Right</span>
              </MenuItem>
            {/if}
            {#if $state.deleteCellSelection.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                onSelect={$state.deleteCellSelection.command}
              >
                <span>Clear Contents</span>
                <span class="text-xs tracking-widest text-gray-500 dark:text-gray-500">Del</span>
              </MenuItem>
            {/if}
            {#if $state.deleteTableColumn.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                onSelect={$state.deleteTableColumn.command}
              >
                <span>Delete Column</span>
              </MenuItem>
            {/if}
            {#if $state.deleteTable.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                data-danger=""
                onSelect={$state.deleteTable.command}
              >
                <span>Delete Table</span>
              </MenuItem>
            {/if}
          </MenuPopup>
        </MenuPositioner>
      </TableHandleColumnMenuRoot>
    </TableHandleColumnPopup>
  </TableHandleColumnPositioner>
  <TableHandleRowPositioner
    placement={props.dir === 'rtl' ? 'right' : 'left'}
    class="z-50 block h-min w-min overflow-visible transition-transform duration-100 ease-out motion-reduce:transition-none"
  >
    <TableHandleRowPopup
      class="box-border flex origin-(--transform-origin) transition-[opacity,scale] transition-discrete duration-100 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 motion-reduce:transition-none ltr:translate-x-[50%] rtl:translate-x-[-50%] starting:scale-95 starting:opacity-0"
    >
      <TableHandleRowMenuRoot>
        <TableHandleRowMenuTrigger
          class="box-border flex h-6 w-4.5 items-center justify-center overflow-clip rounded-sm border border-solid border-gray-200 bg-[canvas] p-0 text-gray-500/50 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400/50 dark:hover:bg-gray-800"
        >
          <GripVerticalIcon class="min-size-5 block size-5" />
        </TableHandleRowMenuTrigger>
        <MenuPositioner
          class="z-50 block h-min w-min overflow-visible transition-transform duration-100 ease-out motion-reduce:transition-none"
        >
          <MenuPopup
            class="relative box-border flex max-h-100 min-w-32 origin-(--transform-origin) flex-col overflow-auto rounded-xl border border-gray-200 bg-[canvas] p-1 whitespace-nowrap shadow-lg transition-[opacity,scale] transition-discrete duration-40 outline-none select-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 motion-reduce:transition-none dark:border-gray-800 starting:scale-95 starting:opacity-0"
          >
            {#if $state.addTableRowAbove.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                onSelect={$state.addTableRowAbove.command}
              >
                <span>Insert Above</span>
              </MenuItem>
            {/if}
            {#if $state.addTableRowBelow.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                onSelect={$state.addTableRowBelow.command}
              >
                <span>Insert Below</span>
              </MenuItem>
            {/if}
            {#if $state.deleteCellSelection.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                onSelect={$state.deleteCellSelection.command}
              >
                <span>Clear Contents</span>
                <span class="text-xs tracking-widest text-gray-500 dark:text-gray-500">Del</span>
              </MenuItem>
            {/if}
            {#if $state.deleteTableRow.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                onSelect={$state.deleteTableRow.command}
              >
                <span>Delete Row</span>
              </MenuItem>
            {/if}
            {#if $state.deleteTable.canExec}
              <MenuItem
                class="relative box-border flex min-w-32 cursor-default scroll-my-1 items-center justify-between gap-8 rounded-sm px-3 py-1.5 whitespace-nowrap outline-hidden select-none data-danger:text-red-500 data-highlighted:bg-gray-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:data-[disabled=true]:opacity-50 dark:data-highlighted:bg-gray-800"
                data-danger=""
                onSelect={$state.deleteTable.command}
              >
                <span>Delete Table</span>
              </MenuItem>
            {/if}
          </MenuPopup>
        </MenuPositioner>
      </TableHandleRowMenuRoot>
    </TableHandleRowPopup>
  </TableHandleRowPositioner>
</TableHandleRoot>
