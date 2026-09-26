import { useQuery } from '@tanstack/react-query'
import { errorText } from '../lib/api-client'
import { dashboardQuery } from './queries'
import { when } from './format'

export function SpacesPage() {
  // Same cached dashboard as the Schedule page, so switching tabs does not refetch.
  const { data, error } = useQuery(dashboardQuery)
  const spaces = data?.spaces ?? []

  return (
    <section>
      <p className="eyebrow">Places</p>
      <h1>Spaces</h1>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      <div className="list">
        {data && spaces.length === 0 ? <p className="muted">No assignments yet.</p> : null}
        {spaces.map((space) => (
          <article className="card" key={space.name}>
            <h2>{space.name}</h2>
            {space.assignments.map((item) => (
              <p key={item.id} className="muted">{item.title} · {when(item.startsAt)} · {item.status.replace('_', ' ')}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}
