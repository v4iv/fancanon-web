import type { User, Session } from 'better-auth'

import type { DatabaseType } from '$lib/server/db'

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Platform {
      env: Env
      ctx: ExecutionContext
      caches: CacheStorage
      cf?: IncomingRequestCfProperties
    }

    interface Locals {
      db: DatabaseType
      user?: User
      session?: Session
    }

    // interface Error {}
    // interface PageData {}
    // interface PageState {}
  }
}

export {}
