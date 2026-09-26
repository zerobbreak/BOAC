import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { volunteerKey } from '../volunteer/queries'
import { opportunitiesQuery, volunteersQuery } from './queries'

export function AssignPage() {
  const queryClient = useQueryClient()
  const opportunities = useQuery(opportunitiesQuery)
  const volunteers = useQuery(volunteersQuery)
  const [volunteerId, setVolunteerId] = useState('')
  const [opportunityId, setOpportunityId] = useState('')
  const [startsAt, setStartsAt] = useState('')

  const assign = useMutation({
    mutationFn: () => unwrap(client.admin.assignments.$post({
      json: {
        volunteerId,
        opportunityId,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      },
    })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: volunteerKey }),
  })
  const error = opportunities.error ?? volunteers.error ?? assign.error

  function onAssign(event: FormEvent) {
    event.preventDefault()
    assign.mutate()
  }

  return (
    <section>
      <p className="eyebrow">Schedule</p>
      <h1>Assign a space</h1>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      {assign.data ? (
        <p>Assigned {assign.data.assignment.title} at {assign.data.assignment.location || 'no location'}.</p>
      ) : null}
      <form className="panel" onSubmit={onAssign}>
        <label>
          Volunteer
          <select value={volunteerId} onChange={(event) => setVolunteerId(event.target.value)} required>
            <option value="">Choose</option>
            {(volunteers.data ?? []).map((person) => (
              <option key={person.id} value={person.id}>{person.name} · {person.email}</option>
            ))}
          </select>
        </label>
        <label>
          Opportunity
          <select value={opportunityId} onChange={(event) => setOpportunityId(event.target.value)} required>
            <option value="">Choose</option>
            {(opportunities.data?.opportunities ?? []).map((item) => (
              <option key={item.id} value={item.id}>{item.title}{item.location ? ` · ${item.location}` : ''}</option>
            ))}
          </select>
        </label>
        <label>
          Starts
          <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
        </label>
        <button type="submit" disabled={assign.isPending}>Assign</button>
      </form>
    </section>
  )
}
