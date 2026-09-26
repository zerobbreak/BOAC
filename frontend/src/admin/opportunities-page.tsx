import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { openOpportunitiesQuery } from '../public/queries'
import { opportunitiesQuery } from './queries'

export function OpportunitiesPage() {
  const queryClient = useQueryClient()
  const { data, error: loadError } = useQuery(opportunitiesQuery)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')

  // The public list and the volunteer form read opportunities too.
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: opportunitiesQuery.queryKey }),
    queryClient.invalidateQueries({ queryKey: openOpportunitiesQuery.queryKey }),
  ])

  const create = useMutation({
    mutationFn: () => unwrap(client.admin.opportunities.$post({ json: { title, location, status: 'open', public: true } })),
    onSuccess: async () => {
      setTitle('')
      setLocation('')
      await refresh()
    },
  })
  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'open' | 'closed' }) =>
      unwrap(client.admin.opportunities[':id'].$patch({ param: { id }, json: { status } })),
    onSettled: refresh,
  })
  const error = loadError ?? create.error ?? toggle.error

  function onCreate(event: FormEvent) {
    event.preventDefault()
    create.mutate()
  }

  return (
    <section className="split">
      <div>
        <p className="eyebrow">Spaces</p>
        <h1>Opportunities</h1>
        {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
        <div className="list">
          {(data?.opportunities ?? []).map((item) => (
            <article className="card" key={item.id}>
              <h2>{item.title}</h2>
              <p className="muted">{item.location || 'No location'} · {item.status} · {item.public ? 'public' : 'hidden'}</p>
              <button
                type="button"
                onClick={() => toggle.mutate({ id: item.id, status: item.status === 'open' ? 'closed' : 'open' })}
              >
                {item.status === 'open' ? 'Close' : 'Reopen'}
              </button>
            </article>
          ))}
        </div>
      </div>
      <form className="panel" onSubmit={onCreate}>
        <h2>New opportunity</h2>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} /></label>
        <button type="submit" disabled={create.isPending}>Create</button>
      </form>
    </section>
  )
}
