import { dev } from '$app/env'
import { DATABASE_URL } from '$app/env/private'
import postgres from 'postgres'
import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'

import * as schema from './schema'

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

let db: any

if (dev) {
  const client = postgres(DATABASE_URL)

  db = drizzlePostgres(client, { schema })
} else {
  const client = neon(DATABASE_URL)
  db = drizzleNeon(client, { schema })
}

export { db }
