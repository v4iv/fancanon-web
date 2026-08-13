<script lang="ts">
  import type { BasicExtension } from 'prosekit/basic'
  import { canUseRegexLookbehind } from 'prosekit/core'
  import { useEditor } from 'prosekit/svelte'
  import {
    AutocompletePopup,
    AutocompletePositioner,
    AutocompleteRoot,
  } from 'prosekit/svelte/autocomplete'

  import SlashMenuEmpty from './slash-menu-empty.svelte'
  import SlashMenuItem from './slash-menu-item.svelte'

  const editor = useEditor<BasicExtension>()

  // Match inputs like "/", "/table", "/heading 1" etc. Do not match "/ heading".
  const regex = new RegExp(
    (canUseRegexLookbehind() ? String.raw`(?<!\S)` : '') + String.raw`\/(\S.*)?$`,
    'u',
  )
</script>

<AutocompleteRoot {regex}>
  <AutocompletePositioner
    class="z-50 block h-min w-min overflow-visible transition-transform duration-100 ease-out motion-reduce:transition-none"
  >
    <AutocompletePopup
      class="relative box-border flex max-h-100 min-h-0 min-w-60 origin-(--transform-origin) flex-col overflow-hidden rounded-xl border border-gray-200 bg-[canvas] whitespace-nowrap shadow-lg transition-[opacity,scale] transition-discrete duration-40 select-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 motion-reduce:transition-none dark:border-gray-800 starting:scale-95 starting:opacity-0"
    >
      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-[canvas] p-1">
        <SlashMenuItem label="Text" onSelect={() => $editor.commands.setParagraph()} />

        <SlashMenuItem
          label="Heading 1"
          onSelect={() => $editor.commands.setHeading({ level: 1 })}
        />

        <SlashMenuItem
          label="Heading 2"
          onSelect={() => $editor.commands.setHeading({ level: 2 })}
        />

        <SlashMenuItem
          label="Heading 3"
          onSelect={() => $editor.commands.setHeading({ level: 3 })}
        />

        <SlashMenuItem
          label="Bullet list"
          onSelect={() => $editor.commands.wrapInList({ kind: 'bullet' })}
        />

        <SlashMenuItem
          label="Ordered list"
          onSelect={() => $editor.commands.wrapInList({ kind: 'ordered' })}
        />

        <SlashMenuItem
          label="Task list"
          onSelect={() => $editor.commands.wrapInList({ kind: 'task' })}
        />

        <SlashMenuItem label="Quote" onSelect={() => $editor.commands.setBlockquote()} />

        <SlashMenuItem
          label="Table"
          onSelect={() => $editor.commands.insertTable({ row: 3, col: 3 })}
        />

        <SlashMenuItem label="Divider" onSelect={() => $editor.commands.insertHorizontalRule()} />

        <SlashMenuEmpty />
      </div>
    </AutocompletePopup>
  </AutocompletePositioner>
</AutocompleteRoot>
