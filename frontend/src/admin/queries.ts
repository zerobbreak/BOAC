 /** 
 * Description:
 *   Shared React Query configurations used across admin pages.
 *   These queries ensure consistent caching, stable keys, and
 *   unified data loading for desk, content, categories, tags,
 *   opportunities, applications, messages, and volunteers.
 *
 * Notes:
 *   - Uses TanStack React Query's `queryOptions` for typed queries.
 *   - Uses `client` and `authClient` wrappers for API calls.
 *   - `unwrap()` normalizes API responses and throws on errors.
 *   - Queries are intentionally centralized to avoid duplication
 *     across admin pages.
*/

import { queryOptions } from '@tanstack/react-query'
import { client, unwrap } from '../lib/api-client'
import { authClient } from '../lib/auth'

// Pages that read the same data share one of these, so they share one cached copy.

export const contentQuery = queryOptions({
  queryKey: ['admin', 'content'],
  queryFn: () => unwrap(client.admin.content.$get({ query: {} })),
})

export const categoriesQuery = queryOptions({
  queryKey: ['admin', 'categories'],
  queryFn: async () => (await unwrap(client.admin.categories.$get())).categories,
})

export const tagsQuery = queryOptions({
  queryKey: ['admin', 'tags'],
  queryFn: async () => (await unwrap(client.admin.tags.$get())).tags,
})

export const opportunitiesQuery = queryOptions({
  queryKey: ['admin', 'opportunities'],
  queryFn: () => unwrap(client.admin.opportunities.$get()),
})

export const applicationsQuery = queryOptions({
  queryKey: ['admin', 'applications'],
  queryFn: () => unwrap(client.admin.applications.$get({ query: {} })),
})

export const messagesQuery = queryOptions({
  queryKey: ['admin', 'messages'],
  queryFn: () => unwrap(client.admin.messages.$get()),
})

export const assignmentsQuery = queryOptions({
  queryKey: ['admin', 'assignments'],
  queryFn: async () => (await unwrap(client.admin.assignments.$get())).assignments,
})

export const volunteersQuery = queryOptions({
  queryKey: ['admin', 'volunteers'],
  // Better Auth returns users a page at a time, so keep asking until every volunteer is in.
  queryFn: async () => {
    const pageSize = 100
    const volunteers = []
    for (let offset = 0; ; offset += pageSize) {
      const result = await authClient.admin.listUsers({
        query: { limit: pageSize, offset, filterField: 'role', filterValue: 'volunteer', filterOperator: 'eq' },
      })
      if (result.error) throw new Error(result.error.message ?? 'Could not load volunteers')
      const { users, total } = result.data
      volunteers.push(...users)
      if (users.length < pageSize || volunteers.length >= total) break
    }
    return volunteers.filter((person) => person.role === 'volunteer')
  },
})
