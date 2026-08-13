<script lang="ts">
  import type { Editor } from 'prosekit/core'
  import type { LinkAttrs } from 'prosekit/extensions/link'
  import type { EditorState } from 'prosekit/pm/state'
  import { useEditor, useEditorDerivedValue } from 'prosekit/svelte'
  import {
    InlinePopoverPopup,
    InlinePopoverPositioner,
    InlinePopoverRoot,
  } from 'prosekit/svelte/inline-popover'

  import { ProsekitButton } from '$lib/components/editor/prosekit-button'
  import {
    BoldIcon,
    CodeIcon,
    ItalicIcon,
    LinkIcon,
    StrikethroughIcon,
    // SubscriptIcon,
    // SuperscriptIcon,
    UnderlineIcon,
  } from '@lucide/svelte'
  import type { EditorExtension } from '$lib/components/editor/extension'

  function getInlineMenuItems(editor: Editor<EditorExtension>) {
    return {
      bold: editor.commands.toggleBold
        ? {
            isActive: editor.marks.bold.isActive(),
            canExec: editor.commands.toggleBold.canExec(),
            command: () => editor.commands.toggleBold(),
          }
        : undefined,
      italic: editor.commands.toggleItalic
        ? {
            isActive: editor.marks.italic.isActive(),
            canExec: editor.commands.toggleItalic.canExec(),
            command: () => editor.commands.toggleItalic(),
          }
        : undefined,
      underline: editor.commands.toggleUnderline
        ? {
            isActive: editor.marks.underline.isActive(),
            canExec: editor.commands.toggleUnderline.canExec(),
            command: () => editor.commands.toggleUnderline(),
          }
        : undefined,
      strike: editor.commands.toggleStrike
        ? {
            isActive: editor.marks.strike.isActive(),
            canExec: editor.commands.toggleStrike.canExec(),
            command: () => editor.commands.toggleStrike(),
          }
        : undefined,
      code: editor.commands.toggleCode
        ? {
            isActive: editor.marks.code.isActive(),
            canExec: editor.commands.toggleCode.canExec(),
            command: () => editor.commands.toggleCode(),
          }
        : undefined,
      link: editor.commands.addLink
        ? {
            isActive: editor.marks.link.isActive(),
            canExec: editor.commands.addLink.canExec({ href: '' }),
            command: () => editor.commands.expandLink(),
            currentLink: getCurrentLink(editor.state) || '',
          }
        : undefined,
      subscript: editor.commands.toggleSubscript
        ? {
            isActive: editor.marks.subscript.isActive(),
            canExec: editor.commands.toggleSubscript.canExec(),
            command: () => editor.commands.toggleSubscript(),
          }
        : undefined,
      superscript: editor.commands.toggleSuperscript
        ? {
            isActive: editor.marks.superscript.isActive(),
            canExec: editor.commands.toggleSuperscript.canExec(),
            command: () => editor.commands.toggleSuperscript(),
          }
        : undefined,
    }
  }

  function getCurrentLink(state: EditorState): string | undefined {
    const from = state.selection.$from
    const marks = from.marksAcross(from)
    if (!marks) {
      return
    }
    for (const mark of marks) {
      if (mark.type.name === 'link') {
        return (mark.attrs as LinkAttrs).href
      }
    }
  }

  const editor = useEditor<EditorExtension>()
  const items = useEditorDerivedValue(getInlineMenuItems)

  let linkMenuOpen = $state(false)
  function toggleLinkMenuOpen() {
    linkMenuOpen = !linkMenuOpen
  }

  function handleLinkUpdate(href?: string) {
    if (href) {
      $editor.commands.addLink({ href })
    } else {
      $editor.commands.removeLink()
    }

    linkMenuOpen = false
    $editor.focus()
  }
</script>

<InlinePopoverRoot
  onOpenChange={(event) => {
    if (!event.detail) linkMenuOpen = false
  }}
>
  <InlinePopoverPositioner
    class="z-50 block h-min w-min overflow-visible transition-transform duration-100 ease-out motion-reduce:transition-none"
  >
    <InlinePopoverPopup
      data-testid="inline-menu-main"
      class="relative box-border flex min-w-32 origin-(--transform-origin) space-x-1 overflow-auto rounded-lg border border-gray-200 bg-[canvas] p-1 whitespace-nowrap shadow-lg transition-[opacity,scale] transition-discrete duration-40 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 motion-reduce:transition-none dark:border-gray-800 starting:scale-95 starting:opacity-0"
    >
      {#if $items.bold}
        <ProsekitButton
          pressed={$items.bold.isActive}
          disabled={!$items.bold.canExec}
          onClick={$items.bold.command}
          tooltip="Bold"
        >
          <BoldIcon />
        </ProsekitButton>
      {/if}
      {#if $items.italic}
        <ProsekitButton
          pressed={$items.italic.isActive}
          disabled={!$items.italic.canExec}
          onClick={$items.italic.command}
          tooltip="Italic"
        >
          <ItalicIcon />
        </ProsekitButton>
      {/if}
      {#if $items.underline}
        <ProsekitButton
          pressed={$items.underline.isActive}
          disabled={!$items.underline.canExec}
          onClick={$items.underline.command}
          tooltip="Underline"
        >
          <UnderlineIcon />
        </ProsekitButton>
      {/if}
      {#if $items.strike}
        <ProsekitButton
          pressed={$items.strike.isActive}
          disabled={!$items.strike.canExec}
          onClick={$items.strike.command}
          tooltip="Strikethrough"
        >
          <StrikethroughIcon />
        </ProsekitButton>
      {/if}
      {#if $items.code}
        <ProsekitButton
          pressed={$items.code.isActive}
          disabled={!$items.code.canExec}
          onClick={$items.code.command}
          tooltip="Code"
        >
          <CodeIcon />
        </ProsekitButton>
      {/if}
      {#if $items.link?.canExec && $items.link}
        <ProsekitButton
          pressed={$items.link.isActive}
          onClick={() => {
            $items.link!.command()
            toggleLinkMenuOpen()
          }}
          tooltip="Link"
        >
          <LinkIcon />
        </ProsekitButton>
      {/if}
      <!-- {#if $items.code} -->
      <!--   <ProsekitButton -->
      <!--     pressed={$items.superscript?.isActive} -->
      <!--     disabled={!$items.superscript?.canExec} -->
      <!--     onClick={$items.superscript?.command} -->
      <!--     tooltip="Superscript" -->
      <!--   > -->
      <!--     <SuperscriptIcon /> -->
      <!--   </ProsekitButton> -->
      <!-- {/if} -->
      <!-- {#if $items.code} -->
      <!--   <ProsekitButton -->
      <!--     pressed={$items.subscript?.isActive} -->
      <!--     disabled={!$items.subscript?.canExec} -->
      <!--     onClick={$items.subscript?.command} -->
      <!--     tooltip="Subscript" -->
      <!--   > -->
      <!--     <SubscriptIcon /> -->
      <!--   </ProsekitButton> -->
      <!-- {/if} -->
    </InlinePopoverPopup>
  </InlinePopoverPositioner>
</InlinePopoverRoot>

<InlinePopoverRoot
  defaultOpen={false}
  open={linkMenuOpen}
  onOpenChange={(event) => {
    linkMenuOpen = event.detail
  }}
>
  <InlinePopoverPositioner
    placement="bottom"
    class="z-50 block h-min w-min overflow-visible transition-transform duration-100 ease-out motion-reduce:transition-none"
  >
    <InlinePopoverPopup
      data-testid="inline-menu-link"
      class="relative box-border flex w-xs origin-(--transform-origin) flex-col items-stretch gap-y-2 rounded-lg border border-gray-200 bg-[canvas] p-4 shadow-lg transition-[opacity,scale] transition-discrete duration-40 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 motion-reduce:transition-none dark:border-gray-800 starting:scale-95 starting:opacity-0"
    >
      {#if linkMenuOpen && $items.link}
        <form
          onsubmit={(event) => {
            event.preventDefault()
            const target = event.target as HTMLFormElement | null
            const href = target?.querySelector('input')?.value?.trim()
            handleLinkUpdate(href)
          }}
        >
          <input
            placeholder="Paste the link..."
            value={$items.link.currentLink || ''}
            class="box-border flex h-9 w-full rounded-md border border-solid border-gray-200 bg-[canvas] px-3 py-2 text-sm ring-0 ring-transparent outline-hidden transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-0 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:placeholder:text-gray-500 dark:focus-visible:ring-gray-300"
          />
        </form>
      {/if}
      {#if $items.link?.isActive}
        <button
          class="inline-flex h-9 items-center justify-center rounded-md border-0 bg-gray-900 px-3 text-sm font-medium whitespace-nowrap text-gray-50 ring-offset-white transition-colors hover:bg-gray-900/90 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:ring-offset-gray-950 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
          onclick={() => handleLinkUpdate()}
          onmousedown={(e) => e.preventDefault()}
        >
          Remove link
        </button>
      {/if}
    </InlinePopoverPopup>
  </InlinePopoverPositioner>
</InlinePopoverRoot>
