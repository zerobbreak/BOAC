import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api'

type Opportunity = {
  id: string
  title: string
  status: 'open' | 'closed'
  public: boolean
  location: string | null
}

export function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const body = await api<{ opportunities: Opportunity[] }>('/admin/opportunities')
    setItems(body.opportunities)
  }

  useEffect(() => {
    load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Load failed'))
  }, [])

  async function create(event: FormEvent) {
    event.preventDefault()
    await api('/admin/opportunities', {
      method: 'POST',
      body: JSON.stringify({ title, location, status: 'open', public: true }),
    })
    setTitle('')
    setLocation('')
    await load()
  }

  return (
    <section className="split">
      <div>
        <p className="eyebrow">Spaces</p>
        <h1>Opportunities</h1>
        {error ? <p className="error">{error}</p> : null}
        <div className="list">
          {items.map((item) => (
            <article className="card" key={item.id}>
              <h2>{item.title}</h2>
              <p className="muted">{item.location || 'No location'} · {item.status} · {item.public ? 'public' : 'hidden'}</p>
              <button
                type="button"
                onClick={() => void api(`/admin/opportunities/${item.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ status: item.status === 'open' ? 'closed' : 'open' }),
                }).then(load)}
              >
                {item.status === 'open' ? 'Close' : 'Reopen'}
              </button>
            </article>
          ))}
        </div>
      </div>
      <form className="panel" onSubmit={(event) => void create(event)}>
        <h2>New opportunity</h2>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} /></label>
        <button type="submit">Create</button>
      </form>
    </section>
  )
}
