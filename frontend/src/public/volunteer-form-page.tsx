import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { openOpportunitiesQuery } from './queries'

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
    <section>
      <p className="eyebrow">Bokwidi Old Age Centre</p>
      <h1>Volunteer With Us</h1>

      <div className="split" style={{ marginTop: '1.4rem' }}>
        <div>
          <blockquote className="panel" style={{ margin: 0 }}>
            <p className="muted">“The measure of a community’s soul is found in how it treats its elders.”</p>
          </blockquote>

          <h2 style={{ marginTop: '2rem' }}>How It Works</h2>
          <div className="list">
            <div className="card">
              <h3>1. Apply Online</h3>
              <p>Fill out the form to let us know your interests and availability.</p>
            </div>
            <div className="card">
              <h3>2. Brief Interview</h3>
              <p>We’ll chat to find the perfect fit for your skills.</p>
            </div>
            <div className="card">
              <h3>3. Start Helping</h3>
              <p>Join orientation and begin making a difference in Bokwidi.</p>
            </div>
          </div>
        </div>

        {submit.isSuccess ? (
          <div className="panel">
            <h2>Application received</h2>
            <p className="success">Thank you. Our team will review your application and contact you by email.</p>
            <button type="button" onClick={() => submit.reset()}>Send another application</button>
          </div>
        ) : (
          <form className="panel" onSubmit={onSubmit}>
            <h2>Application Form</h2>
            <label>
              First Name
              <input value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required />
            </label>
            <label>
              Last Name
              <input value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required />
            </label>
            <label>
              Email Address
              <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
            </label>
            <label>
              Phone Number
              <input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} required />
            </label>
            <label>
              Opportunity
              <select
                value={form.opportunityId}
                onChange={(event) => update('opportunityId', event.target.value)}
                required
                disabled={!opportunities?.length}
              >
                <option value="">
                  {opportunities === null
                    ? 'Loading opportunities…'
                    : opportunities.length
                      ? 'Select where you would like to help…'
                      : 'No opportunities are open right now'}
                </option>
                {(opportunities ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}{item.location ? ` · ${item.location}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Relevant Skills & Experience
              <textarea maxLength={2000} value={form.skills} onChange={(event) => update('skills', event.target.value)} />
            </label>
            <label>
              Availability
              <textarea maxLength={2000} value={form.availability} onChange={(event) => update('availability', event.target.value)} />
            </label>
            <label>
              Why do you want to volunteer with BOAC?
              <textarea maxLength={2000} value={form.motivation} onChange={(event) => update('motivation', event.target.value)} />
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={form.consent} onChange={(event) => update('consent', event.target.checked)} required />
              <span className="muted">I consent to BOAC storing my application data for volunteer coordination.</span>
            </label>
            {error ? <p className="error">{errorText(error, 'Application could not be sent')}</p> : null}
            <button type="submit" disabled={submit.isPending || !opportunities?.length}>
              {submit.isPending ? 'Sending…' : 'Submit Application ▶'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
