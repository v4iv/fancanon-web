import type { LayoutLoad } from './$types'
import { browser } from '$app/env'
import { QueryClient } from '@tanstack/svelte-query'

export const load: LayoutLoad = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  })

  return { queryClient }
}
