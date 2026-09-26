import { queryOptions } from '@tanstack/react-query'
import { client, unwrap } from '../lib/api-client'

// Every volunteer key starts with 'volunteer', so a change can refresh them all at once.
export const volunteerKey = ['volunteer'] as const

export const dashboardQuery = queryOptions({
  queryKey: [...volunteerKey, 'dashboard'],
  queryFn: () => unwrap(client.volunteer.dashboard.$get()),
})

export const workQuery = queryOptions({
  queryKey: [...volunteerKey, 'work'],
  queryFn: () => unwrap(client.volunteer.work.$get()),
})
