import { queryOptions } from '@tanstack/react-query'
import { client, unwrap } from '../lib/api-client'
import { authClient } from '../lib/auth'

// Pages that read the same data share one of these, so they share one cached copy.

export const adminDeskQuery = queryOptions({
  queryKey: ['admin', 'desk'],
  queryFn: () => unwrap(client.admin.$get()),
})

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

export const volunteersQuery = queryOptions({
  queryKey: ['admin', 'volunteers'],
  queryFn: async () => {
    const result = await authClient.admin.listUsers({ query: { limit: 100 } })
    if (result.error) throw new Error(result.error.message ?? 'Could not load volunteers')
    return result.data.users.filter((person) => person.role === 'volunteer')
  },
})
