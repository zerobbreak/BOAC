import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api'
import { place, when, type WorkItem } from './volunteer'

const statuses = ['planned', 'in_progress', 'done'] as const

export function VolunteerWorkPage() {
  const [items, setItems] = useState<WorkItem[]>([])
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const body = await api<{ work: WorkItem[] }>('/volunteer/work')
    setItems(body.work)
  }

  useEffect(() => {
    load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Load failed'))
  }, [])

  async function create(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await api('/volunteer/work', { method: 'POST', body: JSON.stringify({ title, notes }) })
      setTitle('')
      setNotes('')
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not add work')
    }
  }

  async function save(item: WorkItem, patch: { status?: WorkItem['status']; hours?: number; notes?: string }) {
    setError('')
    try {
      await api(`/volunteer/work/${item.id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save')
    }
  }

  return (
    <section className="split">
      <div>
        <p className="eyebrow">Record</p>
        <h1>Your work</h1>
        {error ? <p className="error">{error}</p> : null}
        <div className="list">
          {items.map((item) => (
            <article className="card" key={item.id}>
              <h2>{item.title}</h2>
              <p className="muted">{when(item.startsAt)} · {place(item)}</p>
              <div className="row">
                {statuses.map((status) => (
                  <button
                    key={status}
                    className={item.status === status ? undefined : 'ghost'}
                    type="button"
                    onClick={() => void save(item, { status })}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <label>
                Hours
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  defaultValue={item.hours ?? ''}
                  onBlur={(event) => {
                    const hours = Number(event.target.value)
                    if (event.target.value !== '' && Number.isFinite(hours) && hours !== item.hours) {
                      void save(item, { hours })
                    }
                  }}
                />
              </label>
              <label>
                Notes
                <textarea
                  defaultValue={item.notes}
                  onBlur={(event) => {
                    if (event.target.value !== item.notes) void save(item, { notes: event.target.value })
                  }}
                />
              </label>
            </article>
          ))}
        </div>
      </div>
      <form className="panel" onSubmit={(event) => void create(event)}>
        <h2>Add your own work</h2>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <button type="submit">Add</button>
      </form>
    </section>
  )
}
