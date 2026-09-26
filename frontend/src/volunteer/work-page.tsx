import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { volunteerKey, workQuery } from './queries'
import { place, when, type WorkItem } from './format'

const statuses = ['planned', 'in_progress', 'done'] as const

type Patch = { status?: WorkItem['status']; hours?: number; notes?: string }

export function WorkPage() {
  const queryClient = useQueryClient()
  const { data, error: loadError } = useQuery(workQuery)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')

  // Work also feeds the Schedule and Spaces pages, so refresh everything under ['volunteer'].
  const refresh = () => queryClient.invalidateQueries({ queryKey: volunteerKey })

  const create = useMutation({
    mutationFn: () => unwrap(client.volunteer.work.$post({ json: { title, notes } })),
    onSuccess: async () => {
      setTitle('')
      setNotes('')
      await refresh()
    },
  })
  const save = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Patch }) =>
      unwrap(client.volunteer.work[':id'].$patch({ param: { id }, json: patch })),
    onSettled: refresh,
  })
  const error = loadError ?? create.error ?? save.error

  function onCreate(event: FormEvent) {
    event.preventDefault()
    create.mutate()
  }

  return (
    <section className="split">
      <div>
        <p className="eyebrow">Record</p>
        <h1>Your work</h1>
        {error ? <p className="error">{errorText(error, 'Could not save')}</p> : null}
        <div className="list">
          {(data?.work ?? []).map((item) => (
            <article className="card" key={item.id}>
              <h2>{item.title}</h2>
              <p className="muted">{when(item.startsAt)} · {place(item)}</p>
              <div className="row">
                {statuses.map((status) => (
                  <button
                    key={status}
                    className={item.status === status ? undefined : 'ghost'}
                    type="button"
                    onClick={() => save.mutate({ id: item.id, patch: { status } })}
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
                      save.mutate({ id: item.id, patch: { hours } })
                    }
                  }}
                />
              </label>
              <label>
                Notes
                <textarea
                  defaultValue={item.notes}
                  onBlur={(event) => {
                    if (event.target.value !== item.notes) save.mutate({ id: item.id, patch: { notes: event.target.value } })
                  }}
                />
              </label>
            </article>
          ))}
        </div>
      </div>
      <form className="panel" onSubmit={onCreate}>
        <h2>Add your own work</h2>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <button type="submit" disabled={create.isPending}>Add</button>
      </form>
    </section>
  )
}
