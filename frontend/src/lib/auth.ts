import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { ac, admin, editor, reviewer, user, volunteer } from './access'

export const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [
    adminClient({
      ac,
      roles: { admin, editor, reviewer, user, volunteer },
    }),
  ],
})
