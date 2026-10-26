import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { subjectLabel } from '../public/contact-subjects'
import { messagesQuery } from './queries'

function sentAt(value: string) {
  const date = new Date(value)
  const today = new Date().toDateString() === date.toDateString()
  return today
    ? date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

export function MessagesPage() {
  const queryClient = useQueryClient()
  const { data, error: loadError, isPending } = useQuery(messagesQuery)
  const [show, setShow] = useState<'new' | 'handled'>('new')
  const [selected, setSelected] = useState<string | null>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())

  const mark = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'new' | 'handled' }) =>
      unwrap(client.admin.messages[':id'].$patch({ param: { id }, json: { status } })),
    onSettled: () => queryClient.invalidateQueries({ queryKey: messagesQuery.queryKey }),
  })
  // Several at once, e.g. after replying to a batch. Moving them back is one click each, so no confirm.
  const markHandled = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) await unwrap(client.admin.messages[':id'].$patch({ param: { id }, json: { status: 'handled' } }))
    },
    onSettled: async () => {
      setPicked(new Set())
      setSelected(null)
      await queryClient.invalidateQueries({ queryKey: messagesQuery.queryKey })
    },
  })
  const error = loadError ?? mark.error ?? markHandled.error
  const all = data?.messages ?? []
  const items = all.filter((item) => item.status === show)
  const current = items.find((item) => item.id === selected) ?? items[0]
  const chosen = show === 'new' ? items.filter((item) => picked.has(item.id)) : []

  function toggle(id: string) {
    setPicked((now) => {
      const next = new Set(now)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section>
      <p className="eyebrow">From the contact form</p>
      <h1>Messages</h1>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      <div className="toolbar">
        <div className="filters" role="group" aria-label="Show">
          {(['new', 'handled'] as const).map((value) => (
            <button key={value} type="button" aria-pressed={show === value} onClick={() => setShow(value)}>
              {value === 'new' ? 'New' : 'Handled'} {all.filter((item) => item.status === value).length}
            </button>
          ))}
        </div>
        {chosen.length ? (
          <div className="bulk" role="status">
            <span>{chosen.length === 1 ? '1 message selected' : `${chosen.length} messages selected`}</span>
            <button type="button" disabled={markHandled.isPending} onClick={() => markHandled.mutate(chosen.map((item) => item.id))}>
              Mark handled
            </button>
            <button type="button" className="ghost" style={{ color: 'var(--lime)', borderColor: 'var(--lime)' }} onClick={() => setPicked(new Set())}>Clear</button>
          </div>
        ) : show === 'new' && items.length > 1 ? (
          <button type="button" className="ghost" onClick={() => setPicked(new Set(items.map((item) => item.id)))}>Select all new</button>
        ) : null}
      </div>
      {!isPending && !error && items.length === 0 ? (
        <p className="muted">{show === 'new' ? 'All caught up. New messages from the contact form appear here.' : 'Nothing handled yet.'}</p>
      ) : null}

      {current ? (
        <div className="inbox">
          <ul className="inbox-list" aria-label="Messages">
            {items.map((item) => (
              <li key={item.id}>
                {show === 'new' ? (
                  <input type="checkbox" checked={picked.has(item.id)} onChange={() => toggle(item.id)} aria-label={`Select message from ${item.name}`} />
                ) : null}
                <button type="button" aria-current={item.id === current.id} onClick={() => setSelected(item.id)}>
                  <span className="inbox-top">
                    <span className="inbox-name">{item.name}</span>
                    <span className="muted">{sentAt(item.createdAt)}</span>
                  </span>
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>{subjectLabel(item.subject)}</span>
                  <span className="inbox-sub">{item.message}</span>
                </button>
              </li>
            ))}
          </ul>

          <article className="card inbox-detail">
            <div>
              <h2>{subjectLabel(current.subject)}</h2>
              <p className="muted">
                <strong>{current.name}</strong> · <a href={`mailto:${current.email}`}>{current.email}</a>
                {current.phone ? ` · ${current.phone}` : ''} · {new Date(current.createdAt).toLocaleString('en-ZA')}
              </p>
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{current.message}</p>
            <div className="actions-bar">
              {/* Replies go from the admin's own email app; the site does not send email. */}
              <a className="button" href={`mailto:${current.email}?subject=${encodeURIComponent(`Re: ${subjectLabel(current.subject)}`)}`}>Reply by email</a>
              {current.phone ? <a className="button ghost" href={`tel:${current.phone.replace(/\s+/g, '')}`}>Call {current.phone}</a> : null}
              <button
                type="button"
                className="ghost push"
                disabled={mark.isPending}
                onClick={() => {
                  setSelected(null)
                  mark.mutate({ id: current.id, status: current.status === 'new' ? 'handled' : 'new' })
                }}
              >
                {current.status === 'new' ? 'Mark handled' : 'Move back to new'}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  )
}
