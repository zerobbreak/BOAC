import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'
import { apiBlob, client, errorText, unwrap } from '../lib/api-client'
import { applicationsQuery, assignmentsQuery, opportunitiesQuery, volunteersQuery } from './queries'

type Application = InferResponseType<typeof client.admin.applications.$get, 200>['applications'][number]
type Status = Application['status']

const moves: Record<Status, Status[]> = {
  submitted: ['under_review'],
  under_review: ['needs_info', 'declined', 'accepted'],
  needs_info: ['under_review', 'declined', 'accepted'],
  declined: [],
  accepted: [],
}

const labels: Record<Status, string> = {
  submitted: 'New',
  under_review: 'Reviewing',
  needs_info: 'Needs info',
  declined: 'Declined',
  accepted: 'Accepted',
}

// What each button does, in the admin's words rather than the status name.
const verbs: Record<Status, string> = {
  submitted: 'Back to new',
  under_review: 'Start review',
  needs_info: 'Ask for more info',
  declined: 'Decline',
  accepted: 'Accept & create account',
}

const tones: Partial<Record<Status, string>> = { submitted: 'new', under_review: 'dark', needs_info: 'warn' }

// The backend asks for a note when an application is put on hold or declined.
const needsNote: Status[] = ['needs_info', 'declined']

function steps(status: Status) {
  const end: Status = status === 'declined' ? 'declined' : 'accepted'
  const middle = status === 'needs_info' ? 'Needs info' : labels.under_review
  const at = status === 'submitted' ? 0 : status === 'under_review' || status === 'needs_info' ? 1 : 2
  return [labels.submitted, middle, labels[end]].map((label, index) => ({
    label,
    state: index < at ? 'done' : index === at ? 'current' : 'todo',
  }))
}

export function ApplicationsPage() {
  const queryClient = useQueryClient()
  const { data, error: loadError, isPending } = useQuery(applicationsQuery)
  const opportunities = useQuery(opportunitiesQuery)
  const [show, setShow] = useState<'open' | 'done'>('open')
  const [selected, setSelected] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [passwords, setPasswords] = useState<Record<string, string | null>>({})
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const all = data?.applications ?? []
  const finished = (item: Application) => item.status === 'accepted' || item.status === 'declined'
  const items = all.filter((item) => (show === 'done' ? finished(item) : !finished(item)))
  const current = items.find((item) => item.id === selected) ?? items[0]
  const opportunityName = new Map((opportunities.data?.opportunities ?? []).map((item) => [item.id, item.title]))

  const review = useMutation({
    mutationFn: ({ id, status, internalNotes }: { id: string; status: Status; internalNotes: string }) =>
      unwrap(client.admin.applications[':id'].$patch({ param: { id }, json: { status, internalNotes } })),
    onSuccess: (body, { id, status }) => {
      if (status === 'accepted') {
        const password = 'password' in body && typeof body.password === 'string' ? body.password : null
        setPasswords((existing) => ({ ...existing, [id]: password }))
        setCopied(false)
        // Accepting creates a volunteer and their first piece of work.
        void queryClient.invalidateQueries({ queryKey: volunteersQuery.queryKey })
        void queryClient.invalidateQueries({ queryKey: assignmentsQuery.queryKey })
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: applicationsQuery.queryKey }),
  })
  const showFile = useMutation({
    mutationFn: ({ id, index }: { id: string; index: number }) => apiBlob(`/admin/applications/${id}/files/${index}`),
    onSuccess: (url, { id, index }) => setPreviews((existing) => ({ ...existing, [`${id}-${index}`]: url })),
  })
  const error = loadError ?? review.error ?? showFile.error

  // An application just accepted moves to "Finished"; keep showing it so the password is not lost.
  const accepted = all.find((item) => passwords[item.id] !== undefined && item.id === selected)
  const detail = accepted ?? current
  const note = detail ? notes[detail.id] ?? detail.internalNotes : ''

  return (
    <section>
      <p className="eyebrow">Volunteers</p>
      <h1>Applications</h1>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      <div className="filters" role="group" aria-label="Show">
        <button type="button" aria-pressed={show === 'open'} onClick={() => setShow('open')}>To do {all.filter((item) => !finished(item)).length}</button>
        <button type="button" aria-pressed={show === 'done'} onClick={() => setShow('done')}>Finished {all.filter(finished).length}</button>
      </div>
      {!isPending && !error && items.length === 0 && !accepted ? (
        <p className="muted">{show === 'open' ? 'No applications waiting. New ones from the volunteer form appear here.' : 'Nothing finished yet.'}</p>
      ) : null}

      {detail ? (
        <div className="inbox">
          <ul className="inbox-list" aria-label="Applicants">
            {items.map((item) => (
              <li key={item.id}>
                <button type="button" aria-current={item.id === detail.id} onClick={() => setSelected(item.id)}>
                  <span className="inbox-top">
                    <span className="inbox-name">{item.fullName}</span>
                    <span className="pill" data-tone={tones[item.status]}>{labels[item.status]}</span>
                  </span>
                  <span className="inbox-sub">
                    {opportunityName.get(item.opportunityId) ?? 'Opportunity'} · {new Date(item.submittedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <article className="card inbox-detail">
            <div>
              <h2>{detail.fullName}</h2>
              <p className="muted">
                <a href={`mailto:${detail.email}`}>{detail.email}</a>
                {detail.phone ? ` · ${detail.phone}` : ''} · applied for <strong>{opportunityName.get(detail.opportunityId) ?? 'an opportunity'}</strong>
              </p>
            </div>

            <ol className="steps" aria-label="Progress">
              {steps(detail.status).map((step) => (
                <li key={step.label} data-state={step.state}>{step.state === 'done' ? `✓ ${step.label}` : step.label}</li>
              ))}
            </ol>

            <dl className="facts-grid">
              {([['Skills', detail.skills], ['Available', detail.availability], ['Why BOAC', detail.motivation]] as const).map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>
              ))}
            </dl>

            {detail.files.length ? (
              <div className="row">
                {detail.files.map((file) => (
                  <button key={file.index} type="button" className="ghost" onClick={() => showFile.mutate({ id: detail.id, index: file.index })}>
                    View document {file.index + 1}
                  </button>
                ))}
              </div>
            ) : null}
            {detail.files.map((file) => previews[`${detail.id}-${file.index}`]
              ? <img key={file.index} alt={`Document ${file.index + 1} from ${detail.fullName}`} src={previews[`${detail.id}-${file.index}`]} style={{ maxWidth: 320 }} />
              : null)}

            {passwords[detail.id] !== undefined ? (
              <div className="secret" role="status">
                {passwords[detail.id] ? (
                  <>
                    <strong>Volunteer account created. Give them this password now.</strong>
                    <div className="row">
                      <code>{passwords[detail.id]}</code>
                      <button
                        type="button"
                        onClick={() => void navigator.clipboard.writeText(passwords[detail.id]!).then(() => setCopied(true))}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <span className="muted">It won't be shown again. Their first shift is on the Assign work page.</span>
                  </>
                ) : (
                  <strong>Accepted. They already had a volunteer account, so their password is unchanged.</strong>
                )}
              </div>
            ) : null}

            {moves[detail.status].length ? (
              <>
                <label>
                  Private note (only staff see this)
                  <textarea value={note} onChange={(event) => setNotes({ ...notes, [detail.id]: event.target.value })} />
                  <span className="hint">Needed before asking for more info or declining.</span>
                </label>
                <div className="actions-bar">
                  <strong style={{ fontFamily: 'var(--display)' }}>Next step:</strong>
                  {moves[detail.status].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={status === 'accepted' || detail.status === 'submitted' ? undefined : status === 'declined' ? 'danger' : 'ghost'}
                      disabled={review.isPending || (needsNote.includes(status) && !note.trim())}
                      onClick={() => {
                        if (status === 'accepted') setSelected(detail.id)
                        review.mutate({ id: detail.id, status, internalNotes: note })
                      }}
                    >
                      {verbs[status]}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="muted">
                This application is finished.{detail.internalNotes ? ` Note: ${detail.internalNotes}` : ''}
              </p>
            )}
          </article>
        </div>
      ) : null}
    </section>
  )
}
