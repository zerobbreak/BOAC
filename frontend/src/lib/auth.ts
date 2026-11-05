import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { ac, admin, editor, reviewer, user, volunteer } from './access'

// VITE_API_URL may be relative (/_api behind the Caddy proxy). Better Auth needs an absolute URL, so resolve it
// against the page's origin. Absolute values pass through unchanged.
export const apiUrl = new URL(import.meta.env.VITE_API_URL ?? 'http://localhost:3000', window.location.origin)
  .toString()
  .replace(/\/$/, '')

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
