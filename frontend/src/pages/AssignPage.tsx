import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api'
import { authClient } from '../auth'

type Opportunity = { id: string; title: string; location: string | null }
type Person = { id: string; email: string; name: string; role?: string }

export function AssignPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [volunteers, setVolunteers] = useState<Person[]>([])
  const [volunteerId, setVolunteerId] = useState('')
  const [opportunityId, setOpportunityId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api<{ opportunities: Opportunity[] }>('/admin/opportunities')
      .then((body) => setOpportunities(body.opportunities))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Load failed'))
    void authClient.admin.listUsers({ query: { limit: 100 } }).then((result) => {
      const users = (result.data?.users ?? []) as Person[]
      setVolunteers(users.filter((person) => person.role === 'volunteer'))
    })
  }, [])

  async function assign(event: FormEvent) {
    event.preventDefault()
    setError('')
    const body = await api<{ assignment: { location: string | null; title: string } }>('/admin/assignments', {
      method: 'POST',
      body: JSON.stringify({
        volunteerId,
        opportunityId,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      }),
    })
    setMessage(`Assigned ${body.assignment.title} at ${body.assignment.location || 'no location'}.`)
  }

  return (
    <section>
      <p className="eyebrow">Schedule</p>
      <h1>Assign a space</h1>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p>{message}</p> : null}
      <form className="panel" onSubmit={(event) => void assign(event)}>
        <label>
          Volunteer
          <select value={volunteerId} onChange={(event) => setVolunteerId(event.target.value)} required>
            <option value="">Choose</option>
            {volunteers.map((person) => (
              <option key={person.id} value={person.id}>{person.name} · {person.email}</option>
            ))}
          </select>
        </label>
        <label>
          Opportunity
          <select value={opportunityId} onChange={(event) => setOpportunityId(event.target.value)} required>
            <option value="">Choose</option>
            {opportunities.map((item) => (
              <option key={item.id} value={item.id}>{item.title}{item.location ? ` · ${item.location}` : ''}</option>
            ))}
          </select>
        </label>
        <label>
          Starts
          <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
        </label>
        <button type="submit">Assign</button>
      </form>
    </section>
  )
}
