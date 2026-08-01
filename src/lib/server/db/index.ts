import { dev } from '$app/env'
import { DATABASE_URL } from '$app/env/private'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

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

  // neon-http does NOT support db.transaction() — throws at runtime.
  // neon-serverless (WebSocket) does, and is Cloudflare Workers–compatible.
  const [{ drizzle }, { Pool }] = await Promise.all([
    import('drizzle-orm/neon-serverless'),
    import('@neondatabase/serverless'),
  ])

  const pool = new Pool({ connectionString: DATABASE_URL })

  return drizzle(pool, { schema }) as unknown as NeonHttpDatabase<typeof schema>
})()
