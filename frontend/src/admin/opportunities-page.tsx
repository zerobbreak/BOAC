import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'
import { client, errorText, unwrap } from '../lib/api-client'
import { openOpportunitiesQuery } from '../public/queries'
import { onVolunteerForm, pastClosing } from './dates'
import { applicationsQuery, opportunitiesQuery } from './queries'

type Opportunity = InferResponseType<typeof client.admin.opportunities.$get, 200>['opportunities'][number]
type Form = { title: string; location: string; closingDate: string; public: boolean }

const blank: Form = { title: '', location: '', closingDate: '', public: true }

function toForm(item: Opportunity): Form {
  return {
    title: item.title,
    location: item.location ?? '',
    closingDate: item.closingDate ? new Date(item.closingDate).toISOString().slice(0, 10) : '',
    public: item.public,
  }
}

function dayLabel(value: string) {
  return new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export function OpportunitiesPage() {
  const queryClient = useQueryClient()
  const { data, error: loadError } = useQuery(opportunitiesQuery)
  const applications = useQuery(applicationsQuery)
  const [show, setShow] = useState<'open' | 'closed'>('open')
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(blank)

  const items = data?.opportunities ?? []
  const shown = items.filter((item) => item.status === show)
  const applied = (id: string) => (applications.data?.applications ?? []).filter((item) => item.opportunityId === id).length

  // The public list and the volunteer form read opportunities too.
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: opportunitiesQuery.queryKey }),
    queryClient.invalidateQueries({ queryKey: openOpportunitiesQuery.queryKey }),
  ])

  const save = useMutation({
    mutationFn: () => {
      const fields = { title: form.title, location: form.location, public: form.public }
      return editing
        ? unwrap(client.admin.opportunities[':id'].$patch({ param: { id: editing }, json: { ...fields, closingDate: form.closingDate || null } }))
        : unwrap(client.admin.opportunities.$post({ json: { ...fields, status: 'open', ...(form.closingDate ? { closingDate: form.closingDate } : {}) } }))
    },
    onSuccess: async () => {
      startNew()
      await refresh()
    },
  })
  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'open' | 'closed' }) =>
      unwrap(client.admin.opportunities[':id'].$patch({ param: { id }, json: { status } })),
    onSettled: refresh,
  })
  const error = loadError ?? save.error ?? toggle.error

  function startNew() {
    setEditing(null)
    setForm(blank)
  }

  function edit(item: Opportunity) {
    setEditing(item.id)
    setForm(toForm(item))
  }

  function onSave(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }

  const current = items.find((item) => item.id === editing)

  return (
    <section className="split">
      <div>
        <p className="eyebrow">Volunteers</p>
        <h1>Opportunities</h1>
        <p className="muted page-intro">
          Roles people can apply for. Open, public ones appear in the list on the volunteer form until their closing date.
        </p>
        {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
        <div className="filters" role="group" aria-label="Show">
          {(['open', 'closed'] as const).map((value) => (
            <button key={value} type="button" aria-pressed={show === value} onClick={() => setShow(value)}>
              {value === 'open' ? 'Open' : 'Closed'} {items.filter((item) => item.status === value).length}
            </button>
          ))}
        </div>
        {data && shown.length === 0 ? <p className="muted">No {show} opportunities.</p> : null}
        <div className="list">
          {shown.map((item) => {
            const count = applied(item.id)
            const visible = onVolunteerForm(item)
            return (
              <article className="card" key={item.id} style={editing === item.id ? { borderColor: 'var(--clay)' } : undefined}>
                <div className="inbox-top">
                  <h2>{item.title}</h2>
                  {visible
                    ? <span className="pill" data-tone="dark">On volunteer form</span>
                    : <span className="pill">{!item.public ? 'Staff only' : pastClosing(item) ? 'Past closing date' : 'Closed'}</span>}
                </div>
                <p className="muted">
                  {[item.location || 'No place set', item.closingDate ? `Closes ${dayLabel(item.closingDate)}` : 'No closing date', count === 1 ? '1 application' : `${count} applications`].join(' · ')}
                </p>
                <div className="row">
                  <button type="button" className="ghost" onClick={() => edit(item)}>Edit</button>
                  <button
                    type="button"
                    className="ghost"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate({ id: item.id, status: item.status === 'open' ? 'closed' : 'open' })}
                  >
                    {item.status === 'open' ? 'Close' : 'Reopen'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <form className="panel" onSubmit={onSave}>
        <div className="inbox-top">
          <h2>{current ? 'Edit opportunity' : 'New opportunity'}</h2>
          {current ? <button type="button" className="ghost" onClick={startNew} style={{ minHeight: 36, padding: '6px 12px' }}>New instead</button> : null}
        </div>
        <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
        <label>Where<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="e.g. Main hall kitchen" /></label>
        <label>
          Closing date (optional)
          <input type="date" value={form.closingDate} onChange={(event) => setForm({ ...form, closingDate: event.target.value })} />
          <span className="hint">The last day people can apply. Leave empty to keep it open.</span>
        </label>
        <fieldset className="placement">
          <legend>Who can see it</legend>
          <label>
            <input type="radio" name="visibility" checked={form.public} onChange={() => setForm({ ...form, public: true })} />
            <span><strong>Public</strong><span className="hint">Listed on the volunteer form.</span></span>
          </label>
          <label>
            <input type="radio" name="visibility" checked={!form.public} onChange={() => setForm({ ...form, public: false })} />
            <span><strong>Staff only</strong><span className="hint">Hidden from the public; you can still assign people to it.</span></span>
          </label>
        </fieldset>
        <button type="submit" disabled={save.isPending}>{current ? 'Save changes' : 'Create opportunity'}</button>
      </form>
    </section>
  )
}
