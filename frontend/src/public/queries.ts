import { queryOptions } from '@tanstack/react-query'
import { client, unwrap } from '../lib/api-client'

export const openOpportunitiesQuery = queryOptions({
  queryKey: ['public', 'opportunities'],
  queryFn: () => unwrap(client.opportunities.$get()),
})

// Published posts and articles, newest edit first. The Media page is these, managed from the desk's Content page.
export const mediaQuery = queryOptions({
  queryKey: ['public', 'media'],
  queryFn: async () => (await unwrap(client.content.$get({ query: {} }))).content,
})

export const mediaCategoriesQuery = queryOptions({
  queryKey: ['public', 'categories'],
  queryFn: async () => (await unwrap(client.categories.$get())).categories,
})

export const mediaItemQuery = (id: string) =>
  queryOptions({
    queryKey: ['public', 'media', id],
    queryFn: async () => (await unwrap(client.content[':id'].$get({ param: { id } }))).content,
  })
