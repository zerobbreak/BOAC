import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { authClient } from '../lib/auth'
import { LitemaBand } from '../public/sections'
import aboutHero from '../public/images/about-hero.webp'
import logo from '../public/images/boac-logo.webp'

export function LoginPage() {
  const { data, isPending } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isPending && data?.user) return <Navigate to="/desk" replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const result = await authClient.signIn.email({ email, password })
    if (result.error) setError(result.error.message ?? 'Sign-in failed')
  }

  return (
    <div className="desk login">
      <div className="login-art">
        <img src={aboutHero} alt="" />
        <LitemaBand />
      </div>
      <div className="login-side">
        <form onSubmit={(event) => void onSubmit(event)}>
          <Link to="/" className="desk-logo">
            <img src={logo} alt="Bokwidi Old Age Centre — public site" />
          </Link>
          <p className="eyebrow">Staff and volunteers</p>
          <h1>Sign in to the desk</h1>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>
          {error ? <p className="error" role="alert">{error}</p> : null}
          <button type="submit">Sign in</button>
          <p className="muted">
            Not signed up yet? <Link to="/volunteer">Volunteer with us</Link> or <Link to="/get-involved">see other ways to help</Link>.
          </p>
        </form>
      </div>
    </div>
  )
}
