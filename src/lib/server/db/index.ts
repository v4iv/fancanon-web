import { dev } from '$app/env'
import { DATABASE_URL } from '$app/env/private'

import * as schema from './schema'

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

export const db = await (async () => {
  if (dev) {
    const [{ drizzle }, { default: postgres }] = await Promise.all([
      import('drizzle-orm/postgres-js'),

      import('postgres'),
    ])

    return drizzle(postgres(DATABASE_URL), { schema })
  }

  const [{ drizzle }, { neon }] = await Promise.all([
    import('drizzle-orm/neon-http'),

    import('@neondatabase/serverless'),
  ])

  return drizzle(neon(DATABASE_URL), { schema })
})()
