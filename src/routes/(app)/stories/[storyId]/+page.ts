import type { PageLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageLoad = async ({ fetch, params }) => {
  const response = await fetch(`/api/stories/${params.storyId}`)

  if (response.status !== 200) {
    error(response.status, 'Not Found')
  }

  const data: any = await response.json()

  return {
    story: data.story,
  }
}
