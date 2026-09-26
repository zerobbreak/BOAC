import { useEffect, useState } from 'react'
import { api } from '../api'

type Message = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'handled'
  createdAt: string
}

export function MessagesPage() {
  const [items, setItems] = useState<Message[]>([])
  const [error, setError] = useState('')

  async function load() {
    const body = await api<{ messages: Message[] }>('/admin/messages')
    setItems(body.messages)
  }

  useEffect(() => {
    load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Load failed'))
  }, [])

  async function mark(item: Message) {
    setError('')
    try {
      await api(`/admin/messages/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: item.status === 'new' ? 'handled' : 'new' }),
      })
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Update failed')
    }
  }

  return (
    <section>
      <p className="eyebrow">Inbox</p>
      <h1>Messages</h1>
      {error ? <p className="error">{error}</p> : null}
      {items.length === 0 && !error ? <p className="muted">No messages yet.</p> : null}
      <div className="list">
        {items.map((item) => (
          <article className="card" key={item.id}>
            <h2>{item.name}</h2>
            <p className="muted">
              <a href={`mailto:${item.email}`}>{item.email}</a>
              {item.phone ? ` · ${item.phone}` : ''} · {item.subject} · {new Date(item.createdAt).toLocaleString()} · {item.status}
            </p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{item.message}</p>
            <button type="button" className={item.status === 'new' ? undefined : 'ghost'} onClick={() => void mark(item)}>
              {item.status === 'new' ? 'Mark handled' : 'Mark new'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
