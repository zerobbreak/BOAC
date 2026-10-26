import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { volunteerKey } from '../volunteer/queries'
import { assignmentsQuery, opportunitiesQuery, volunteersQuery } from './queries'

const statusLabel = { planned: 'Planned', in_progress: 'In progress', done: 'Done' } as const

function shiftTime(value: string | null) {
  if (!value) return 'No start time'
  return new Date(value).toLocaleString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AssignPage() {
  const queryClient = useQueryClient()
  const opportunities = useQuery(opportunitiesQuery)
  const volunteers = useQuery(volunteersQuery)
  const assignments = useQuery(assignmentsQuery)
  const [volunteerId, setVolunteerId] = useState('')
  const [opportunityId, setOpportunityId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [show, setShow] = useState<'upcoming' | 'done'>('upcoming')

  const assign = useMutation({
    mutationFn: () => unwrap(client.admin.assignments.$post({
      json: {
        volunteerId,
        opportunityId,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      },
    })),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: volunteerKey }),
      queryClient.invalidateQueries({ queryKey: assignmentsQuery.queryKey }),
    ]),
  })
  const error = opportunities.error ?? volunteers.error ?? assignments.error ?? assign.error

  const all = assignments.data ?? []
  const shown = all.filter((item) => (show === 'done' ? item.status === 'done' : item.status !== 'done'))
  // Warn before booking someone twice at the same time.
  const clash = startsAt && volunteerId
    ? all.find((item) => item.volunteerId === volunteerId && item.status !== 'done' && item.startsAt
      && new Date(item.startsAt).getTime() === new Date(startsAt).getTime())
    : undefined

  function onAssign(event: FormEvent) {
    event.preventDefault()
    assign.mutate()
  }

  return (
    <section>
      <p className="eyebrow">Volunteers</p>
      <h1>Assign work</h1>
      <p className="muted page-intro">Put a volunteer on a shift. It shows on their Schedule straight away.</p>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      {assign.data ? (
        <p className="success" role="status">
          Assigned {assign.data.assignment.title}
          {assign.data.assignment.startsAt ? ` on ${shiftTime(assign.data.assignment.startsAt)}` : ''}
          {assign.data.assignment.location ? ` at ${assign.data.assignment.location}` : ''}.
        </p>
      ) : null}

      <form className="card" onSubmit={onAssign} style={{ marginBottom: 32 }}>
        <div className="form-row">
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
              {(opportunities.data?.opportunities ?? []).filter((item) => item.status === 'open').map((item) => (
                <option key={item.id} value={item.id}>{item.title}{item.location ? ` · ${item.location}` : ''}</option>
              ))}
            </select>
          </label>
          <label>
            Starts
            <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          </label>
        </div>
        {clash ? (
          <p className="notice" role="alert">
            {clash.volunteerName} already has {clash.title} at {shiftTime(clash.startsAt)}. You can still assign this if it's meant to be.
          </p>
        ) : null}
        <button type="submit" disabled={assign.isPending}>Assign</button>
      </form>

      <div className="toolbar">
        <h2>Shifts</h2>
        <div className="filters" role="group" aria-label="Show">
          <button type="button" aria-pressed={show === 'upcoming'} onClick={() => setShow('upcoming')}>Coming up</button>
          <button type="button" aria-pressed={show === 'done'} onClick={() => setShow('done')}>Done</button>
        </div>
      </div>
      {assignments.isPending ? <p className="muted">Loading…</p> : null}
      {assignments.data && shown.length === 0 ? <p className="muted">{show === 'done' ? 'No finished shifts yet.' : 'Nothing assigned yet.'}</p> : null}
      {shown.length ? (
        <div className="table-box">
          <table>
            <thead>
              <tr><th>When</th><th>Volunteer</th><th>Work</th><th>Where</th><th>Status</th>{show === 'done' ? <th>Hours</th> : null}</tr>
            </thead>
            <tbody>
              {shown.map((item) => (
                <tr key={item.id}>
                  <td>{shiftTime(item.startsAt)}</td>
                  <td>{item.volunteerName}</td>
                  <td>{item.title}</td>
                  <td>{item.location ?? (item.opportunityId ? '—' : 'Logged by volunteer')}</td>
                  <td><span className="pill" data-tone={item.status === 'in_progress' ? 'new' : undefined}>{statusLabel[item.status]}</span></td>
                  {show === 'done' ? <td>{item.hours ?? '—'}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
