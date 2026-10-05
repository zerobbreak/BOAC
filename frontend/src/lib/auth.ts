import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { ac, admin, editor, reviewer, user, volunteer } from './access'

export const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const authClient = createAuthClient({
  // Full auth path, so an API base behind a path prefix (the /_api proxy) still resolves.
  baseURL: `${apiUrl}/api/auth`,
  plugins: [
    adminClient({
      ac,
      roles: { admin, editor, reviewer, user, volunteer },
    }),
  ],
})
