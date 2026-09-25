import { useEffect, useState } from 'react'
import { api } from '../api'
import { when, type VolunteerDashboard, type WorkItem } from './volunteer'

export function VolunteerSpacesPage() {
  const [spaces, setSpaces] = useState<VolunteerDashboard['spaces']>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api<VolunteerDashboard>('/volunteer/dashboard')
      .then((body) => setSpaces(body.spaces))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Load failed'))
  }, [])

  return (
    <section>
      <p className="eyebrow">Places</p>
      <h1>Spaces</h1>
      {error ? <p className="error">{error}</p> : null}
      <div className="list">
        {spaces.length === 0 ? <p className="muted">No assignments yet.</p> : null}
        {spaces.map((space) => (
          <article className="card" key={space.name}>
            <h2>{space.name}</h2>
            {space.assignments.map((item: WorkItem) => (
              <p key={item.id} className="muted">{item.title} · {when(item.startsAt)} · {item.status.replace('_', ' ')}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}
