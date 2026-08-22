import { dev } from '$app/env'
import { DATABASE_URL } from '$app/env/private'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

import * as schema from '$lib/server/db/schema'

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

const client = postgres(DATABASE_URL)

export const db = drizzle(client, { schema, logger: dev })

export function createDb(env: App.Platform['env']) {
  const databaseUrl = env.HYPERDRIVE.connectionString

  if (!databaseUrl) {
    throw new Error('HYPERDRIVE connection string is missing')
  }

  // Create postgres client using the Hyperdrive connection string
  const client = postgres(databaseUrl)

  return drizzle(client, { schema, logger: dev })
}

export type DatabaseType = ReturnType<typeof createDb>
