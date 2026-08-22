<script lang="ts">
  import type { Editor } from 'prosekit/core'
  import { useEditorDerivedValue } from 'prosekit/svelte'
  import { CaseLowerIcon, WholeWordIcon } from '@lucide/svelte'

  import { Separator } from '$lib/components/ui/separator'

  interface Props {
    wordCount: number
    characterCount: number
  }

  // eslint-disable-next-line no-useless-assignment
  let { wordCount = $bindable(0), characterCount = $bindable(0) }: Props = $props()

  function getCounts(editor: Editor) {
    const doc = editor.state.doc
    const words = doc ? doc.textBetween(0, doc.content.size, ' ') : ''
    const wordCount = words.split(/\s+/).filter((word) => word).length
    const characterCount = doc ? doc.textContent.length : 0
    return { wordCount, characterCount }
  }

  const counts = useEditorDerivedValue(getCounts)

  counts.subscribe((value) => {
    wordCount = value.wordCount
    characterCount = value.characterCount
  })
</script>

<div
  class="absolute right-0 bottom-0 left-0 flex h-8 w-full justify-end gap-2 border-t pt-2 text-xs text-muted-foreground"
>
  <span class="flex items-center gap-2">
    <WholeWordIcon class="size-4 text-muted-foreground" />
    {$counts.wordCount}
  </span>

  <Separator orientation="vertical" />

  <span class="flex items-center gap-2">
    <CaseLowerIcon class="size-4 text-muted-foreground" />
    {$counts.characterCount}
  </span>
</div>
