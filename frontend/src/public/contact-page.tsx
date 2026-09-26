import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { client, errorText, unwrap } from '../lib/api-client'
import { LitemaBand } from './sections'

const subjects = [
  ['general', 'General question'],
  ['volunteer', 'Volunteering'],
  ['donation', 'Donations and sponsorship'],
  ['partnership', 'Partnership'],
] as const

type Subject = (typeof subjects)[number][0]

function subjectFrom(value: string | null): Subject {
  return subjects.find(([key]) => key === value)?.[0] ?? 'general'
}

export function ContactPage() {
  const [params] = useSearchParams()
  const blank = { name: '', email: '', phone: '', subject: subjectFrom(params.get('subject')), message: '' }
  const [form, setForm] = useState(blank)
  const send = useMutation({
    mutationFn: () => unwrap(client.contact.$post({ json: form })),
    onSuccess: () => setForm(blank),
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    send.mutate()
  }

  return (
    <>
      <div className="wrap">
        <div className="intro">
          <p className="kicker">Contact</p>
          <h1 className="page-title">Come by, call, or write.</h1>
          <p className="lede">Questions about care, volunteering or giving — our team replies within one or two working days.</p>
        </div>
      </div>

      <LitemaBand />

      <section className="section">
        <div className="wrap aside-grid">
          <div className="stack">
            <dl className="details">
              <div><dt>Address</dt><dd>Bokwidi Village, Waterberg District, Limpopo, South Africa</dd></div>
              <div><dt>Phone</dt><dd><a href="tel:+27151234567">+27 (0)15 123 4567</a></dd></div>
              <div><dt>Email</dt><dd><a href="mailto:info@bokwidioldagecentre.org.za">info@bokwidioldagecentre.org.za</a></dd></div>
              <div><dt>Hours</dt><dd>Monday – Friday, 08:00 – 16:00<br />Closed weekends</dd></div>
            </dl>
            <a className="map-link" href="https://www.google.com/maps/search/?api=1&query=Bokwidi+Village+Limpopo" target="_blank" rel="noreferrer">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              <div>
                <strong>Find us on the map</strong>
                <span>Opens Google Maps in a new tab</span>
              </div>
            </a>
          </div>

          <div className="form-card">
            {send.isSuccess ? (
              <div className="form-done" role="status">
                <h2>Message sent.</h2>
                <p>Thank you. Our team will reply to your email within one or two working days.</p>
                <button type="button" className="btn btn-line" onClick={() => send.reset()}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <h2>Send a message</h2>
                <p className="form-intro">Everything except your phone number is required.</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="contact-name">Full name</label>
                    <input id="contact-name" className="input" autoComplete="name" maxLength={200} value={form.name} onChange={(event) => update('name', event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Email</label>
                    <input id="contact-email" type="email" className="input" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-phone">Phone (optional)</label>
                    <input id="contact-phone" type="tel" className="input" autoComplete="tel" maxLength={40} value={form.phone} onChange={(event) => update('phone', event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-subject">About</label>
                    <select id="contact-subject" className="input" value={form.subject} onChange={(event) => update('subject', subjectFrom(event.target.value))}>
                      {subjects.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" className="input" maxLength={5000} value={form.message} onChange={(event) => update('message', event.target.value)} required />
                </div>
                {send.error ? <p className="form-error" role="alert">{errorText(send.error, 'Message could not be sent')}</p> : null}
                <button type="submit" className="btn btn-clay btn-block" disabled={send.isPending}>
                  {send.isPending ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
