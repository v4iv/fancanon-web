import { canUseRegexLookbehind, union } from 'prosekit/core'
import { defineBasicExtension } from 'prosekit/basic'
import { definePlaceholder } from 'prosekit/extensions/placeholder'
import { defineHorizontalRule } from 'prosekit/extensions/horizontal-rule'
import { defineSubscript } from 'prosekit/extensions/subscript'
import { defineSuperscript } from 'prosekit/extensions/superscript'
import { defineMarkInputRule } from 'prosekit/extensions/input-rule'

const extension = union(
  defineBasicExtension(),
  definePlaceholder({ placeholder: 'Press / for commands...' }),
  defineHorizontalRule(),
  defineSubscript(),
  defineSuperscript(),
  defineMarkInputRule({
    regex: new RegExp(
      (canUseRegexLookbehind() ? String.raw`(?<=\s|^)` : '') +
        String.raw`~([^\s~]|[^\s~][^~]*[^\s~])~$`,
    ),
    type: 'subscript',
  }),
  defineMarkInputRule({
    regex: new RegExp(
      (canUseRegexLookbehind() ? String.raw`(?<=\s|^)` : '') +
        String.raw`\^([^\s^]|[^\s^][^^]*[^\s^])\^$`,
    ),
    type: 'superscript',
  }),
)

export default extension

export type EditorExtension = typeof extension
