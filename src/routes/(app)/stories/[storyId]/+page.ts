import { BASE_API_URL } from '$app/env/public'
import type { PageLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageLoad = async ({ fetch, params }) => {
  const response = await fetch(`${BASE_API_URL}/v1/stories/${params.storyId}`, {
    credentials: 'include',
  })

  if (response.status !== 200) {
    error(response.status, 'Not Found')
  }

  const data: any = await response.json()

  return {
    story: data.story,
  }
}
