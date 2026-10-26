import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { volunteerKey, workQuery } from './queries'
import { place, when, type WorkItem } from './format'

const statuses = ['planned', 'in_progress', 'done'] as const
const statusLabel = { planned: 'Planned', in_progress: 'Doing it', done: 'Done' } as const

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
        <h1>My work</h1>
        <p className="muted page-intro">Mark how each shift went and how long you stayed. Changes save when you leave a box.</p>
        {error ? <p className="error">{errorText(error, 'Could not save')}</p> : null}
        <div className="list">
          {(data?.work ?? []).map((item) => (
            <article className="card" key={item.id}>
              <h2>{item.title}</h2>
              <p className="muted">{when(item.startsAt)} · {place(item)}</p>
              <fieldset>
                <legend>How is it going?</legend>
                <div className="segmented">
                  {statuses.map((status) => (
                    <label key={status}>
                      <input
                        type="radio"
                        name={`status-${item.id}`}
                        checked={item.status === status}
                        onChange={() => save.mutate({ id: item.id, patch: { status } })}
                      />
                      <span>{statusLabel[status]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
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
                Notes for staff
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
        <h2>Did something extra?</h2>
        <p className="muted">Log help that wasn't on your schedule, like fixing a gate or driving someone home.</p>
        <label>What did you do?<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <button type="submit" disabled={create.isPending}>Add to my work</button>
      </form>
    </section>
  )
}
