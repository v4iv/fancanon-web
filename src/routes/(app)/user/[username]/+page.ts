import type { PageLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/user/${params.username}`)

  if (res.status === 404) {
    error(res.status, 'Not Found')
  }

  if (res.status !== 200) {
    error(res.status, res.statusText)
  }

  const data: any = await res.json()

  return { ...data }
}
