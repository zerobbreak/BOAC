import { useEffect, useState } from 'react'
import { api, apiBlob } from '../api'

type Application = {
  id: string
  fullName: string
  email: string
  status: string
  internalNotes: string
  files: Array<{ index: number; url: string }>
}

const moves: Record<string, string[]> = {
  submitted: ['under_review'],
  under_review: ['needs_info', 'declined', 'accepted'],
  needs_info: ['under_review', 'declined', 'accepted'],
  declined: [],
  accepted: [],
}

export function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [passwords, setPasswords] = useState<Record<string, string | null>>({})
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  async function load() {
    const body = await api<{ applications: Application[] }>('/admin/applications')
    setItems(body.applications)
  }

  useEffect(() => {
    load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Load failed'))
  }, [])

  async function review(item: Application, status: string) {
    setError('')
    const body = await api<{ password?: string | null }>(`/admin/applications/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, internalNotes: notes[item.id] ?? item.internalNotes }),
    })
    if (status === 'accepted') setPasswords((current) => ({ ...current, [item.id]: body.password ?? null }))
    await load()
  }

  async function showFile(item: Application, index: number) {
    const url = await apiBlob(`/admin/applications/${item.id}/files/${index}`)
    setPreviews((current) => ({ ...current, [`${item.id}-${index}`]: url }))
  }

  return (
    <section>
      <p className="eyebrow">Review</p>
      <h1>Applications</h1>
      {error ? <p className="error">{error}</p> : null}
      <div className="list">
        {items.map((item) => (
          <article className="card" key={item.id}>
            <h2>{item.fullName}</h2>
            <p className="muted">{item.email} · {item.status}</p>
            <label>
              Note
              <textarea value={notes[item.id] ?? item.internalNotes} onChange={(event) => setNotes({ ...notes, [item.id]: event.target.value })} />
            </label>
            <div className="row">
              {(moves[item.status] ?? []).map((status) => (
                <button key={status} type="button" onClick={() => void review(item, status)}>{status.replace('_', ' ')}</button>
              ))}
              {item.files.map((file) => (
                <button key={file.index} type="button" className="ghost" onClick={() => void showFile(item, file.index)}>
                  File {file.index + 1}
                </button>
              ))}
            </div>
            {item.files.map((file) => previews[`${item.id}-${file.index}`]
              ? <img key={file.index} alt="" src={previews[`${item.id}-${file.index}`]} style={{ maxWidth: '220px', marginTop: '0.6rem' }} />
              : null)}
            {passwords[item.id] !== undefined ? (
              <p>Password, shown once: {passwords[item.id] ?? 'existing volunteer, no new password'}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
