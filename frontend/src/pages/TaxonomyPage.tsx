import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api'

type Named = { id: string; name: string }

function NameList({ path, label }: { path: 'categories' | 'tags'; label: string }) {
  const [items, setItems] = useState<Named[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const body = await api<Record<string, Named[]>>(`/admin/${path}`)
    setItems(body[path] ?? [])
  }

  useEffect(() => {
    load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Load failed'))
  }, [path])

  async function add(event: FormEvent) {
    event.preventDefault()
    await api(`/admin/${path}`, { method: 'POST', body: JSON.stringify({ name }) })
    setName('')
    await load()
  }

  return (
    <section>
      <h2>{label}</h2>
      {error ? <p className="error">{error}</p> : null}
      <form className="row" onSubmit={(event) => void add(event)}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder={`New ${label.toLowerCase()}`} required />
        <button type="submit">Add</button>
      </form>
      <div className="list">
        {items.map((item) => (
          <div className="card row" key={item.id}>
            <span>{item.name}</span>
            <button className="ghost" type="button" onClick={() => void api(`/admin/${path}/${item.id}`, { method: 'DELETE' }).then(load)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export function TaxonomyPage() {
  return (
    <div className="split">
      <div>
        <p className="eyebrow">Labels</p>
        <h1>Library</h1>
        <NameList path="categories" label="Categories" />
      </div>
      <NameList path="tags" label="Tags" />
    </div>
  )
}
