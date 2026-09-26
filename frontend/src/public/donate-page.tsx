import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LitemaBand, SplitHero } from './sections'
import heroElder from './images/hero-elder.webp'

const accountDetails = [
  ['Account name', 'Bokwidi Old Age Centre'],
  ['Bank', 'Standard Bank'],
  ['Account number', '123 456 789 0'],
  ['Branch code', '051 001'],
] as const

const reasons = [
  ['Daily nutrition', 'Balanced, culturally familiar meals that keep our seniors healthy and strong.'],
  ['Health care', 'Regular check-ups, help with medication, and care for age-related conditions.'],
  ['Community programmes', 'Social activities, skills workshops and well-being support that prevent isolation.'],
] as const

export function DonatePage() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copyDetails() {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      const lines = accountDetails.map(([label, value]) => `${label}: ${value}`)
      await navigator.clipboard.writeText([...lines, 'Reference: your name or organisation'].join('\n'))
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 3000)
  }

  return (
    <>
      <SplitHero kicker="Give" title="Give to the elders of Bokwidi." image={heroElder} alt="An elder of Bokwidi Village smiling in the community garden">
        <p className="lede">
          Your gift pays for nutritious meals, health care, and a safe, dignified place to spend the day — for those
          who guided us.
        </p>
      </SplitHero>

      <LitemaBand />

      <section className="section">
        <div className="wrap aside-grid">
          <div className="stack reveal">
            <h2 className="section-title">What your gift pays for</h2>
            <ul className="reasons">
              {reasons.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="form-card reveal">
            <h2>Make a bank transfer</h2>
            <p className="form-intro">Use these details to give directly to the centre.</p>
            <dl className="bank">
              {accountDetails.map(([label, value]) => (
                <div key={label} style={{ display: 'contents' }}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <dt>Reference</dt>
              <dd className="bank-muted">Your name or organisation</dd>
            </dl>
            <button type="button" className="btn btn-line btn-block" onClick={() => void copyDetails()}>
              {copyState === 'copied' ? 'Copied' : 'Copy bank details'}
            </button>
            <p role="status" className="form-error" style={{ margin: copyState === 'failed' ? '12px 0 0' : 0 }}>
              {copyState === 'failed' ? 'Your browser blocked copying. Please select and copy the details above.' : ''}
            </p>
            <p style={{ marginTop: 20, color: 'var(--soil)' }}>
              Giving goods, or sponsoring as a business?{' '}
              <Link to="/contact?subject=donation" className="text-link">Talk to us</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
