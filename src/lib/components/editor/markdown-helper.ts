import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkSuperSub from 'remark-supersub'
import rehypeRemark from 'rehype-remark'
import remarkRehype from 'remark-rehype'
import remarkStringify from 'remark-stringify'
import rehypeStringify from 'rehype-stringify'

export async function markdownToHtml(markdown: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSuperSub)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown)
  return String(file)
}

export async function htmlToMarkdown(html: string) {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify)
    .process(html)

  return String(file)
}
