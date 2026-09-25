import { useEffect, useState } from 'react'
import { api } from '../api'
import { place, when, type VolunteerDashboard, type WorkItem } from './volunteer'

function Shift({ item }: { item: WorkItem }) {
  return (
    <article className="card">
      <h2>{item.title}</h2>
      <p className="muted">{when(item.startsAt)} · {place(item)} · {item.status.replace('_', ' ')}</p>
      {item.hours !== null ? <p className="muted">{item.hours} hours recorded</p> : null}
    </article>
  )
}

export function VolunteerHomePage() {
  const [desk, setDesk] = useState<VolunteerDashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<VolunteerDashboard>('/volunteer/dashboard')
      .then(setDesk)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Load failed'))
  }, [])

  return (
    <section>
      <p className="eyebrow">Schedule</p>
      <h1>{desk ? desk.profile.name : 'Your shifts'}</h1>
      {error ? <p className="error">{error}</p> : null}
      <h2>Upcoming</h2>
      <div className="list">
        {desk?.schedule.upcoming.length ? desk.schedule.upcoming.map((item) => <Shift key={item.id} item={item} />) : <p className="muted">Nothing scheduled.</p>}
      </div>
      <h2>Finished</h2>
      <div className="list">
        {desk?.schedule.finished.length ? desk.schedule.finished.map((item) => <Shift key={item.id} item={item} />) : <p className="muted">No finished work yet.</p>}
      </div>
    </section>
  )
}
