import { useQuery } from '@tanstack/react-query'
import { errorText } from '../lib/api-client'
import { dashboardQuery } from './queries'
import { when } from './format'

const statusLabel = { planned: 'Planned', in_progress: 'Doing it', done: 'Done' } as const

export function SpacesPage() {
  // Same cached dashboard as the Schedule page, so switching tabs does not refetch.
  const { data, error } = useQuery(dashboardQuery)
  const spaces = data?.spaces ?? []

  return (
    <section>
      <p className="eyebrow">Where you help</p>
      <h1>Places</h1>
      <p className="muted page-intro">Your shifts grouped by where they happen, so you know where to go.</p>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      {data && spaces.length === 0 ? <p className="muted">No shifts yet, so no places to show.</p> : null}
      <div className="tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {spaces.map((space) => {
          const open = space.assignments.filter((item) => item.status !== 'done')
          const done = space.assignments.length - open.length
          return (
            <article className="card" key={space.name}>
              <div className="inbox-top">
                <h2>{space.name}</h2>
                <span className="muted">{space.assignments.length === 1 ? '1 shift' : `${space.assignments.length} shifts`}</span>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {open.map((item) => (
                  <li key={item.id} className="inbox-top">
                    <span>{item.title} · {when(item.startsAt)}</span>
                    <span className="pill" data-tone={item.status === 'in_progress' ? 'new' : undefined}>{statusLabel[item.status]}</span>
                  </li>
                ))}
                {done ? <li className="muted">{done === 1 ? '1 earlier shift done' : `${done} earlier shifts done`}</li> : null}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}
