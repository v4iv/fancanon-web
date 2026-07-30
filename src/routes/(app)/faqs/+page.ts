import type { PageLoad } from './$types'
import { error } from '@sveltejs/kit'
import { captureException } from '@sentry/sveltekit'

export const prerender = true

export const load: PageLoad = async () => {
  try {
    // @ts-expect-error because it's a markdown file
    const markdown = await import('../../../content/en/faqs.md')

    return { frontmatter: markdown.metadata }
  } catch (err) {
    captureException(err)
    error(404, 'Not Found')
  }
}
