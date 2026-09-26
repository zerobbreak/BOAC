import { useQuery } from '@tanstack/react-query'
import { errorText } from '../lib/api-client'
import { dashboardQuery } from './queries'
import { place, when, type WorkItem } from './format'

function Shift({ item }: { item: WorkItem }) {
  return (
    <article className="card">
      <h2>{item.title}</h2>
      <p className="muted">{when(item.startsAt)} · {place(item)} · {item.status.replace('_', ' ')}</p>
      {item.hours !== null ? <p className="muted">{item.hours} hours recorded</p> : null}
    </article>
  )
}

export function SchedulePage() {
  const { data: desk, error } = useQuery(dashboardQuery)

  return (
    <section>
      <p className="eyebrow">Schedule</p>
      <h1>{desk ? desk.profile.name : 'Your shifts'}</h1>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
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
