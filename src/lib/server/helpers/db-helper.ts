// $lib/server/db/execute-rows.ts
import { dev } from '$app/env'
import type { SQL } from 'drizzle-orm'
import { DATABASE_URL } from '$app/env/private'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
// postgres-js returns rows directly; neon-http (like node-postgres)
// wraps them in { rows }. Normalize so callers never have to care
// which driver is active for the current environment.
export async function executeRows<T = Record<string, unknown>>(query: SQL): Promise<T[]> {
  const result = await db.execute(query)
  return Array.isArray(result) ? (result as T[]) : (result as { rows: T[] }).rows
}

type Tx = Parameters<Parameters<NeonHttpDatabase<typeof schema>['transaction']>[0]>[0]

// Creates a fresh, request-scoped connection JUST for this transaction call
// — never stored, never reused across requests, so it can never trigger
// Workers' cross-request I/O restriction. In dev, reuses the existing
// postgres-js `db`, which already supports transactions safely as a
// singleton (dev has no isolate-reuse-across-requests constraint).
export async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  if (dev) {
    return db.transaction(fn as any)
  }

  const [{ drizzle }, { Client }] = await Promise.all([
    import('drizzle-orm/neon-serverless'),
    import('@neondatabase/serverless'),
  ])

  const client = new Client(DATABASE_URL)

  await client.connect()
  try {
    const txDb = drizzle(client, { schema })
    return await txDb.transaction(fn as any)
  } finally {
    await client.end()
  }
}
