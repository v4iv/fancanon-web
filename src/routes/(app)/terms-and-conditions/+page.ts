import type { PageLoad } from './$types'
import { error } from '@sveltejs/kit'
import { captureException } from '@sentry/sveltekit'

import { getLocale } from '$lib/paraglide/runtime'

export const prerender = true

export const load: PageLoad = async () => {
  try {
    const locale = getLocale()

    const markdown = await import(`../../../content/${locale}/terms-and-conditions.md`)

    return { content: markdown.default, frontmatter: markdown.metadata }
  } catch (err) {
    captureException(err)
    error(404, 'Not Found')
  }
}
