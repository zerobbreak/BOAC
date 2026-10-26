import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { errorText } from '../lib/api-client'
import { dashboardQuery } from './queries'
import { place, type WorkItem } from './format'

function DateBadge({ value }: { value: string | null }) {
  if (!value) return <div className="date-badge"><span>Any</span><span>–</span><span>time</span></div>
  const date = new Date(value)
  return (
    <div className="date-badge" aria-hidden="true">
      <span>{date.toLocaleDateString('en-ZA', { weekday: 'short' })}</span>
      <span>{date.getDate()}</span>
      <span>{date.toLocaleDateString('en-ZA', { month: 'short' })}</span>
    </div>
  )
}

function startLabel(value: string | null) {
  if (!value) return 'No start time yet'
  const date = new Date(value)
  const time = date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
  if (date.toDateString() === new Date().toDateString()) return `Today, ${time}`
  return `${date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}, ${time}`
}

function Shift({ item }: { item: WorkItem }) {
  return (
    <article className="card date-row">
      <DateBadge value={item.startsAt} />
      <div>
        <h2>{item.title}</h2>
        <p className="muted">
          {item.startsAt ? new Date(item.startsAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : 'No start time'} · {place(item)}
          {item.status === 'in_progress' ? ' · in progress' : ''}
        </p>
      </div>
    </article>
  )
}

export function SchedulePage() {
  const { data: desk, error, isPending } = useQuery(dashboardQuery)
  const upcoming = desk?.schedule.upcoming ?? []
  const finished = desk?.schedule.finished ?? []
  const [next, ...later] = upcoming
  const hours = finished.reduce((total, item) => total + (item.hours ?? 0), 0)
  const firstName = desk?.profile.name.split(' ')[0]

  return (
    <section>
      <p className="eyebrow">Schedule</p>
      <h1>{firstName ? `Hi ${firstName}` : 'Your shifts'}</h1>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      {isPending ? <p className="muted">Loading…</p> : null}

      {next ? (
        <div className="next-shift">
          <div>
            <p className="eyebrow">Your next shift</p>
            <strong>{startLabel(next.startsAt)}</strong>
            <span>{next.title} · {place(next)}</span>
          </div>
          <Link to="/desk/work" className="button">Log hours for this shift</Link>
        </div>
      ) : desk ? (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2>Nothing scheduled</h2>
          <p className="muted">The team will add your shifts here. You can still log help you gave on My work.</p>
        </div>
      ) : null}

      {desk ? (
        <div className="tiles" style={{ marginTop: 0 }}>
          <div className="card"><span className="tile-count">{upcoming.length}</span><span className="muted">{upcoming.length === 1 ? 'shift coming up' : 'shifts coming up'}</span></div>
          <div className="card"><span className="tile-count">{finished.length}</span><span className="muted">{finished.length === 1 ? 'shift done' : 'shifts done'}</span></div>
          <div className="card"><span className="tile-count">{hours}</span><span className="muted">hours given</span></div>
        </div>
      ) : null}

      {later.length ? (
        <>
          <h2>Coming up</h2>
          <div className="list">{later.map((item) => <Shift key={item.id} item={item} />)}</div>
        </>
      ) : null}
      {finished.length ? <Link to="/desk/work" className="back-link">See finished shifts in My work →</Link> : null}
    </section>
  )
}
