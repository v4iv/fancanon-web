import { dev } from '$app/env'
import { DATABASE_URL } from '$app/env/private'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

import * as schema from './schema'

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

export const db = await (async (): Promise<NeonHttpDatabase<typeof schema>> => {
  if (dev) {
    const [{ drizzle }, { default: postgres }] = await Promise.all([
      import('drizzle-orm/postgres-js'),

      import('postgres'),
    ])

    // Cast: both drivers expose the same pg-core query-builder surface
    // for standard select/insert/update/delete/transaction — the
    // concrete generic types just differ enough that a runtime union
    // breaks overload resolution on methods like .returning({...}).
    // Pinning db's exported type to one shape fixes that everywhere.
    return drizzle(postgres(DATABASE_URL), { schema }) as unknown as NeonHttpDatabase<typeof schema>
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
