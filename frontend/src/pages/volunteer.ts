export type WorkItem = {
  id: string
  title: string
  status: 'planned' | 'in_progress' | 'done'
  notes: string
  opportunityId: string | null
  opportunityTitle: string | null
  location: string | null
  startsAt: string | null
  hours: number | null
  createdAt: string
  updatedAt: string
}

export type VolunteerDashboard = {
  profile: { id: string; name: string; email: string; role: string }
  schedule: { upcoming: WorkItem[]; finished: WorkItem[] }
  spaces: { name: string; assignments: WorkItem[] }[]
}

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
