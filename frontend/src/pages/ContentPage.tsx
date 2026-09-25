import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../api'

type Content = {
  id: string
  type: 'post' | 'article'
  title: string
  body: string
  status: 'draft' | 'published'
  coverUrl: string | null
}

export function ContentPage() {
  const [items, setItems] = useState<Content[]>([])
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<'post' | 'article'>('post')

  async function load() {
    const result = await api<{ content: Content[] }>('/admin/content')
    setItems(result.content)
  }

  useEffect(() => {
    load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Load failed'))
  }, [])

  async function create(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await api('/admin/content', { method: 'POST', body: JSON.stringify({ title, body, type }) })
      setTitle('')
      setBody('')
      await load()
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Save failed')
    }
  }

  async function setStatus(item: Content, status: 'draft' | 'published') {
    await api(`/admin/content/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
    await load()
  }

  async function uploadCover(id: string, file: File) {
    const form = new FormData()
    form.set('cover', file)
    await api(`/admin/content/${id}/cover`, { method: 'POST', body: form })
    await load()
  }

  return (
    <section className="split">
      <div>
        <p className="eyebrow">Public site</p>
        <h1>Content</h1>
        {error ? <p className="error">{error}</p> : null}
        <div className="list">
          {items.map((item) => (
            <article className="card" key={item.id}>
              <h2>{item.title}</h2>
              <p className="muted">{item.type} · {item.status}{item.coverUrl ? ' · cover set' : ''}</p>
              <div className="row">
                <button type="button" onClick={() => void setStatus(item, item.status === 'published' ? 'draft' : 'published')}>
                  {item.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <label>
                  Cover
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadCover(item.id, file)
                  }} />
                </label>
                <button className="ghost" type="button" onClick={() => void api(`/admin/content/${item.id}`, { method: 'DELETE' }).then(load)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <form className="panel" onSubmit={(event) => void create(event)}>
        <h2>New draft</h2>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value as 'post' | 'article')}>
            <option value="post">Post</option>
            <option value="article">Article</option>
          </select>
        </label>
        <label>Body<textarea value={body} onChange={(event) => setBody(event.target.value)} /></label>
        <button type="submit">Save draft</button>
      </form>
    </section>
  )
}
