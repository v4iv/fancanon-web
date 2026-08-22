import { createAuthClient } from 'better-auth/svelte' // make sure to import from better-auth/svelte
import { customSessionClient, usernameClient } from 'better-auth/client/plugins'

import type { AuthType } from '$lib/server/auth'

export const authClient = createAuthClient({
  // you can pass client configuration here
  plugins: [usernameClient(), customSessionClient<AuthType>()],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  resetPassword,
  changePassword,
  requestPasswordReset,
  sendVerificationEmail,
} = authClient
