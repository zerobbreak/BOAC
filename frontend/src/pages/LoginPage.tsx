import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { authClient } from '../auth'

export function LoginPage() {
  const { data, isPending } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isPending && data?.user) return <Navigate to="/" replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const result = await authClient.signIn.email({ email, password })
    if (result.error) setError(result.error.message ?? 'Sign-in failed')
  }

  return (
    <div className="login">
      <form onSubmit={(event) => void onSubmit(event)}>
        <p className="eyebrow">BOAC</p>
        <h1>Sign in</h1>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit">Enter</button>
        <p className="muted">
          Not signed up yet? <Link to="/volunteer-form">Volunteer with us</Link> or <Link to="/get-involved">see other ways to help</Link>.
        </p>
      </form>
    </div>
  )
}
