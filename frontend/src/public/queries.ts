import { queryOptions } from '@tanstack/react-query'
import { client, unwrap } from '../lib/api-client'

export const openOpportunitiesQuery = queryOptions({
  queryKey: ['public', 'opportunities'],
  queryFn: () => unwrap(client.opportunities.$get()),
})
