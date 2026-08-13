<script lang="ts">
  import 'prosekit/basic/style.css'
  import 'prosekit/basic/typography.css'
  import { browser } from '$app/env'
  import { ProseKit, useDocChange } from 'prosekit/svelte'
  import { createEditor } from 'prosekit/core'

  import extension from '$lib/components/editor/extension'
  import { BlockHandle } from '$lib/components/editor/block-handle'
  import { TableHandle } from '$lib/components/editor/table-handle'
  import { WordCount } from '$lib/components/editor/word-count'
  import { SlashMenu } from '$lib/components/editor/slash-menu'
  import { InlineMenu } from '$lib/components/editor/inline-menu'
  import { DropIndicator } from '$lib/components/editor/drop-indicator'
  import { htmlToMarkdown, markdownToHtml } from '$lib/components/editor/markdown-helper'

  interface Props {
    initialContent?: string
    value: string
    wordCount?: number
    characterCount?: number
  }

  let {
    initialContent,
    value = $bindable(''),
    wordCount = $bindable(0),
    characterCount = $bindable(0),
  }: Props = $props()

  // svelte-ignore state_referenced_locally
  const html = await markdownToHtml(initialContent ?? value)

  const editor = createEditor({ extension, defaultContent: browser ? html : '' })

  useDocChange(
    async () => {
      value = await htmlToMarkdown(editor.getDocHTML())
    },
    { editor },
  )
</script>

<ProseKit {editor}>
  <div
    class="box-border flex field-sizing-content size-full min-h-60 w-full overflow-x-hidden overflow-y-hidden rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
  >
    <div class="relative box-border w-full flex-1 overflow-y-auto">
      <div
        {@attach editor.mount}
        class="ProseMirror box-border min-h-full px-[max(4rem,calc(50%-20rem))] pt-4 pb-14 outline-hidden outline-0"
      ></div>

      <InlineMenu />
      <SlashMenu />
      <TableHandle />
      <BlockHandle />
      <DropIndicator />
      <WordCount bind:wordCount bind:characterCount />
    </div>
  </div>
</ProseKit>
