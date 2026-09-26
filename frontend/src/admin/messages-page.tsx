import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { messagesQuery } from './queries'

export function MessagesPage() {
  const queryClient = useQueryClient()
  const { data, error: loadError, isPending } = useQuery(messagesQuery)

  const mark = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'new' | 'handled' }) =>
      unwrap(client.admin.messages[':id'].$patch({ param: { id }, json: { status } })),
    onSettled: () => queryClient.invalidateQueries({ queryKey: messagesQuery.queryKey }),
  })
  const error = loadError ?? mark.error
  const items = data?.messages ?? []

  return (
    <section>
      <p className="eyebrow">Inbox</p>
      <h1>Messages</h1>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      {!isPending && items.length === 0 && !error ? <p className="muted">No messages yet.</p> : null}
      <div className="list">
        {items.map((item) => (
          <article className="card" key={item.id}>
            <h2>{item.name}</h2>
            <p className="muted">
              <a href={`mailto:${item.email}`}>{item.email}</a>
              {item.phone ? ` · ${item.phone}` : ''} · {item.subject} · {new Date(item.createdAt).toLocaleString()} · {item.status}
            </p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{item.message}</p>
            <button
              type="button"
              className={item.status === 'new' ? undefined : 'ghost'}
              onClick={() => mark.mutate({ id: item.id, status: item.status === 'new' ? 'handled' : 'new' })}
            >
              {item.status === 'new' ? 'Mark handled' : 'Mark new'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
