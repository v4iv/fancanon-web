// $lib/server/db/execute-rows.ts
import type { SQL } from 'drizzle-orm'
import { db } from '$lib/server/db'

// postgres-js returns rows directly; neon-http (like node-postgres)
// wraps them in { rows }. Normalize so callers never have to care
// which driver is active for the current environment.
export async function executeRows<T = Record<string, unknown>>(query: SQL): Promise<T[]> {
  const result = await db.execute(query)
  return Array.isArray(result) ? (result as T[]) : (result as { rows: T[] }).rows
}
