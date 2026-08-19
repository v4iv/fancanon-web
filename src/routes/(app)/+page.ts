import type { PageLoad } from './$types'

import { DEFAULT_LIMIT, DEFAULT_PAGE } from '$lib/constants'
import { BASE_API_URL } from '$app/env/public'

export const load: PageLoad = async ({ parent, fetch }) => {
  const { queryClient } = await parent()

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['new', 'stories'],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      const res = await fetch(
        `${BASE_API_URL}/v1/feed/new?page=${pageParam}&limit=${DEFAULT_LIMIT}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        throw new Error('Network response was not ok')
      }
      return res.json()
    },
    initialPageParam: DEFAULT_PAGE,
  })

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['hot', 'stories'],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      const res = await fetch(
        `${BASE_API_URL}/v1/feed/hot?page=${pageParam}&limit=${DEFAULT_LIMIT}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        throw new Error('Network response was not ok')
      }
      return res.json()
    },
    initialPageParam: DEFAULT_PAGE,
  })
}
