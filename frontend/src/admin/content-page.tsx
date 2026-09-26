import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { contentQuery } from './queries'

type ContentType = 'post' | 'article'

export function ContentPage() {
  const queryClient = useQueryClient()
  const { data, error: loadError } = useQuery(contentQuery)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<ContentType>('post')

  const refresh = () => queryClient.invalidateQueries({ queryKey: contentQuery.queryKey })

  const create = useMutation({
    mutationFn: () => unwrap(client.admin.content.$post({ json: { title, body, type } })),
    onSuccess: async () => {
      setTitle('')
      setBody('')
      await refresh()
    },
  })
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'draft' | 'published' }) =>
      unwrap(client.admin.content[':id'].$patch({ param: { id }, json: { status } })),
    onSettled: refresh,
  })
  const uploadCover = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      unwrap(client.admin.content[':id'].cover.$post({ param: { id }, form: { cover: file } })),
    onSettled: refresh,
  })
  const remove = useMutation({
    mutationFn: (id: string) => unwrap(client.admin.content[':id'].$delete({ param: { id } })),
    onSettled: refresh,
  })

  const error = loadError ?? create.error ?? setStatus.error ?? uploadCover.error ?? remove.error

  function onCreate(event: FormEvent) {
    event.preventDefault()
    create.mutate()
  }

  return (
    <section className="split">
      <div>
        <p className="eyebrow">Public site</p>
        <h1>Content</h1>
        {error ? <p className="error">{errorText(error, 'Save failed')}</p> : null}
        <div className="list">
          {(data?.content ?? []).map((item) => (
            <article className="card" key={item.id}>
              <h2>{item.title}</h2>
              <p className="muted">{item.type} · {item.status}{item.coverUrl ? ' · cover set' : ''}</p>
              <div className="row">
                <button
                  type="button"
                  onClick={() => setStatus.mutate({ id: item.id, status: item.status === 'published' ? 'draft' : 'published' })}
                >
                  {item.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <label>
                  Cover
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) uploadCover.mutate({ id: item.id, file })
                  }} />
                </label>
                <button className="ghost" type="button" onClick={() => remove.mutate(item.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <form className="panel" onSubmit={onCreate}>
        <h2>New draft</h2>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value as ContentType)}>
            <option value="post">Post</option>
            <option value="article">Article</option>
          </select>
        </label>
        <label>Body<textarea value={body} onChange={(event) => setBody(event.target.value)} /></label>
        <button type="submit" disabled={create.isPending}>Save draft</button>
      </form>
    </section>
  )
}
