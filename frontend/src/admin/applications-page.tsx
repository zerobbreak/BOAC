import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiBlob, client, errorText, unwrap } from '../lib/api-client'
import { applicationsQuery, volunteersQuery } from './queries'

type Status = 'submitted' | 'under_review' | 'needs_info' | 'declined' | 'accepted'

const moves: Record<Status, Status[]> = {
  submitted: ['under_review'],
  under_review: ['needs_info', 'declined', 'accepted'],
  needs_info: ['under_review', 'declined', 'accepted'],
  declined: [],
  accepted: [],
}

export function ApplicationsPage() {
  const queryClient = useQueryClient()
  const { data, error: loadError } = useQuery(applicationsQuery)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [passwords, setPasswords] = useState<Record<string, string | null>>({})
  const [previews, setPreviews] = useState<Record<string, string>>({})

  const review = useMutation({
    mutationFn: ({ id, status, internalNotes }: { id: string; status: Status; internalNotes: string }) =>
      unwrap(client.admin.applications[':id'].$patch({ param: { id }, json: { status, internalNotes } })),
    onSuccess: (body, { id, status }) => {
      if (status === 'accepted') {
        const password = 'password' in body && typeof body.password === 'string' ? body.password : null
        setPasswords((current) => ({ ...current, [id]: password }))
        // Accepting creates a volunteer and their first piece of work.
        void queryClient.invalidateQueries({ queryKey: volunteersQuery.queryKey })
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: applicationsQuery.queryKey }),
  })
  const showFile = useMutation({
    mutationFn: ({ id, index }: { id: string; index: number }) => apiBlob(`/admin/applications/${id}/files/${index}`),
    onSuccess: (url, { id, index }) => setPreviews((current) => ({ ...current, [`${id}-${index}`]: url })),
  })
  const error = loadError ?? review.error ?? showFile.error

  return (
    <section>
      <p className="eyebrow">Review</p>
      <h1>Applications</h1>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      <div className="list">
        {(data?.applications ?? []).map((item) => (
          <article className="card" key={item.id}>
            <h2>{item.fullName}</h2>
            <p className="muted">{item.email}{item.phone ? ` · ${item.phone}` : ''} · {item.status}</p>
            {([['Skills', item.skills], ['Availability', item.availability], ['Why BOAC', item.motivation]] as const).map(([label, value]) =>
              value ? <p key={label} style={{ whiteSpace: 'pre-wrap' }}><strong>{label}:</strong> {value}</p> : null)}
            <label>
              Note
              <textarea value={notes[item.id] ?? item.internalNotes} onChange={(event) => setNotes({ ...notes, [item.id]: event.target.value })} />
            </label>
            <div className="row">
              {moves[item.status].map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: item.id, status, internalNotes: notes[item.id] ?? item.internalNotes })}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
              {item.files.map((file) => (
                <button key={file.index} type="button" className="ghost" onClick={() => showFile.mutate({ id: item.id, index: file.index })}>
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
