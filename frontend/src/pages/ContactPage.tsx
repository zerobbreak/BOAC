import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'

const subjects = [
  ['general', 'General Inquiry'],
  ['volunteer', 'Volunteer'],
  ['donation', 'Donation'],
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
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSending(true)
    try {
      await api('/contact', { method: 'POST', body: JSON.stringify(form) })
      setSent(true)
      setForm(blank)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Message could not be sent')
    } finally {
      setSending(false)
    }
  }

  return (
    <section>
      <p className="eyebrow">Bokwidi Old Age Centre</p>
      <h1>Contact Us</h1>

      <div className="split" style={{ marginTop: '1.4rem' }}>
        <div className="panel">
          <h2>Our Location</h2>
          <p><strong>Address:</strong><br />Bokwidi Village, Waterberg District, Limpopo, South Africa</p>
          <p><strong>Phone:</strong><br /><a href="tel:+27151234567">+27 (0)15 123 4567</a></p>
          <p><strong>Email:</strong><br /><a href="mailto:info@bokwidioldagecentre.org.za">info@bokwidioldagecentre.org.za</a></p>
          <p><strong>Hours:</strong><br />Mon–Fri: 08:00–16:00<br />Weekends: Closed</p>
          <a
            className="button"
            href="https://www.google.com/maps/search/?api=1&query=Bokwidi+Village+Limpopo"
            target="_blank"
            rel="noreferrer"
          >
            Open in Maps →
          </a>
        </div>

        {sent ? (
          <div className="panel">
            <h2>Message sent</h2>
            <p className="success">Thank you. Our team will reply to your email within a few working days.</p>
            <button type="button" onClick={() => setSent(false)}>Send another message</button>
          </div>
        ) : (
          <form className="panel" onSubmit={(event) => void onSubmit(event)}>
            <h2>Send Us a Message</h2>
            <label>
              Full Name
              <input maxLength={200} value={form.name} onChange={(event) => update('name', event.target.value)} required />
            </label>
            <label>
              Email Address
              <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
            </label>
            <label>
              Phone Number (Optional)
              <input type="tel" maxLength={40} value={form.phone} onChange={(event) => update('phone', event.target.value)} />
            </label>
            <label>
              Subject
              <select value={form.subject} onChange={(event) => update('subject', subjectFrom(event.target.value))}>
                {subjects.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label>
              Message
              <textarea
                placeholder="How can we help you today?"
                maxLength={5000}
                value={form.message}
                onChange={(event) => update('message', event.target.value)}
                required
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send Message'}</button>
          </form>
        )}
      </div>
    </section>
  )
}
