import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const prerender = true

export const load: PageLoad = async () => {
  try {
    // @ts-expect-error because it's a markdown file
    const markdown = await import('../../../content/en/terms-and-conditions.md')

    return { content: markdown.default, frontmatter: markdown.metadata }
  } catch (err) {
    console.error(err)
    error(404, 'Not Found')
  }
}
