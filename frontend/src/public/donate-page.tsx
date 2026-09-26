import { useState } from 'react'
import { Link } from 'react-router-dom'

const accountDetails = [
  ['Account Name', 'Bokwidi Old Age Centre'],
  ['Bank', 'Standard Bank'],
  ['Account Number', '123 456 789 0'],
  ['Branch Code', '051 001'],
  ['Reference', 'Your Name / Org'],
] as const

export function DonatePage() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copyDetails() {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(accountDetails.map(([label, value]) => `${label}: ${value}`).join('\n'))
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 3000)
  }

  return (
    <section>
      <p className="eyebrow">Empower Our Elders, Strengthen Our Community</p>
      <h1>Support BOAC</h1>

      <div className="panel" style={{ marginTop: '1.4rem' }}>
        <h2>Your contribution directly impacts daily lives.</h2>
        <p className="muted">
          Every donation helps us provide nutritious meals, essential healthcare, and a safe, dignified environment
          for the elders of Bokwidi Village.
        </p>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Why Your Support Matters</h2>
      <div className="cards">
        <article className="card">
          <h3>Daily Nutrition</h3>
          <p>Balanced, culturally appropriate meals that help seniors maintain health and vitality.</p>
        </article>
        <article className="card">
          <h3>Healthcare Access</h3>
          <p>Regular check-ups, medication support, and specialized care for age-related conditions.</p>
        </article>
        <article className="card">
          <h3>Community Programs</h3>
          <p>Social activities, skills workshops, and mental well-being initiatives that prevent isolation.</p>
        </article>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Make a Bank Transfer</h2>
      <div className="panel" style={{ marginTop: '1rem' }}>
        {accountDetails.map(([label, value]) => (
          <p key={label}><strong>{label}:</strong> {value}</p>
        ))}
        <button type="button" onClick={() => void copyDetails()}>
          {copyState === 'copied' ? 'Copied!' : 'Copy Account Details'}
        </button>
        {copyState === 'failed' ? (
          <p className="error">Your browser blocked copying. Please select and copy the details above.</p>
        ) : null}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Need Assistance?</h2>
      <div className="card" style={{ marginTop: '1rem' }}>
        <p>For corporate sponsorships, in-kind donations, or partnership enquiries, our team is ready to assist.</p>
        <Link className="button" to="/contact?subject=donation">Contact Us →</Link>
      </div>
    </section>
  )
}
