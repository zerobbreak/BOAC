import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { openOpportunitiesQuery } from './queries'
import { LitemaBand } from './sections'

const blank = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  opportunityId: '',
  skills: '',
  availability: '',
  motivation: '',
  consent: false,
}

const steps = [
  ['Apply online', 'Tell us what you’d like to do and when you’re free.'],
  ['A short conversation', 'We meet to find the right fit for your skills.'],
  ['Start helping', 'Join an orientation morning and begin.'],
] as const

export function VolunteerFormPage() {
  const listing = useQuery(openOpportunitiesQuery)
  const opportunities = listing.data?.opportunities ?? (listing.isPending ? null : [])
  const [form, setForm] = useState(blank)

  const submit = useMutation({
    mutationFn: () => unwrap(client.applications.$post({
      form: {
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email,
        phone: form.phone,
        opportunityId: form.opportunityId,
        skills: form.skills,
        availability: form.availability,
        motivation: form.motivation,
      },
    })),
    onSuccess: () => setForm(blank),
  })
  const error = listing.error ?? submit.error

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    submit.mutate()
  }

  return (
    <>
      <div className="wrap">
        <div className="intro">
          <p className="kicker">Volunteer</p>
          <h1 className="page-title">Give your time to the elders of Bokwidi.</h1>
          <p className="lede">Cook, drive, garden, read aloud, or simply sit and talk. Every hour you give is felt.</p>
        </div>
      </div>

      <LitemaBand />

      <section className="section">
        <div className="wrap aside-grid">
          <div className="stack">
            <h2 className="section-title" style={{ fontSize: 36 }}>How it works</h2>
            <ol className="steps">
              {steps.map(([title, text], index) => (
                <li key={title}>
                  <span className="row-num">{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {opportunities?.length ? (
              <>
                <h2 style={{ fontSize: 24, marginTop: 12 }}>Where help is needed now</h2>
                {/* The open opportunities; picking one fills in the form below. */}
                <div className="choice-list">
                  {opportunities.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="choice"
                      aria-pressed={form.opportunityId === item.id}
                      onClick={() => update('opportunityId', item.id)}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="form-card">
            {submit.isSuccess ? (
              <div className="form-done" role="status">
                <h2>Thank you.</h2>
                <p>Your application has reached our team. We’ll be in touch by email to arrange a conversation.</p>
                <button type="button" className="btn btn-line" onClick={() => submit.reset()}>Send another application</button>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <h2>Application</h2>
                <p className="form-intro">It takes about five minutes.</p>

                <p className="form-legend">About you</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="vol-first">First name</label>
                    <input id="vol-first" className="input" autoComplete="given-name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vol-last">Last name</label>
                    <input id="vol-last" className="input" autoComplete="family-name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vol-email">Email</label>
                    <input id="vol-email" type="email" className="input" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vol-phone">Phone</label>
                    <input id="vol-phone" type="tel" className="input" autoComplete="tel" placeholder="082 123 4567" value={form.phone} onChange={(event) => update('phone', event.target.value)} required />
                  </div>
                </div>

                <p className="form-legend">How you’d like to help</p>
                <div className="form-group">
                  <label htmlFor="vol-area">Area of interest</label>
                  <select
                    id="vol-area"
                    className="input"
                    value={form.opportunityId}
                    onChange={(event) => update('opportunityId', event.target.value)}
                    required
                    disabled={!opportunities?.length}
                  >
                    <option value="">
                      {opportunities === null
                        ? 'Loading…'
                        : opportunities.length
                          ? 'Choose where you’d like to help'
                          : 'No roles are open right now'}
                    </option>
                    {(opportunities ?? []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}{item.location ? ` · ${item.location}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="vol-skills">Skills and experience</label>
                  <textarea id="vol-skills" className="input" maxLength={2000} placeholder="Any volunteering you’ve done, or skills you bring" value={form.skills} onChange={(event) => update('skills', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="vol-availability">When are you free?</label>
                  <input id="vol-availability" className="input" maxLength={2000} placeholder="e.g. Tuesday mornings, weekends" value={form.availability} onChange={(event) => update('availability', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="vol-motivation">Why BOAC?</label>
                  <textarea id="vol-motivation" className="input" maxLength={2000} value={form.motivation} onChange={(event) => update('motivation', event.target.value)} />
                </div>
                <div className="form-group">
                  <label className="consent">
                    <input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} required />
                    <span>
                      I agree that BOAC may store my application to coordinate volunteers, and understand I may be
                      contacted for a conversation.
                    </span>
                  </label>
                </div>
                {error ? <p className="form-error" role="alert">{errorText(error, 'Application could not be sent')}</p> : null}
                <button type="submit" className="btn btn-clay btn-block" disabled={submit.isPending || !opportunities?.length}>
                  {submit.isPending ? 'Sending…' : 'Send application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
