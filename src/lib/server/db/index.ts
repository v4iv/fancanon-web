import { dev } from '$app/env'
import { DATABASE_URL } from '$app/env/private'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

import * as schema from '$lib/server/db/schema'

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

const client = postgres(DATABASE_URL)

export const db = drizzle(client, { schema, logger: dev })
