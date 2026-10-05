import type { InferResponseType } from 'hono/client'
import type { client } from '../lib/api-client'

export type VolunteerDashboard = InferResponseType<typeof client.volunteer.dashboard.$get, 200>
export type WorkItem = InferResponseType<typeof client.volunteer.work.$get, 200>['work'][number]

export function when(value: string | null) {
  if (!value) return 'No start time'
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function place(item: WorkItem) {
  return item.location || item.opportunityTitle || 'Unassigned'
}
