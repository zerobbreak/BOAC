import { useEffect, useState } from 'react'
import { api } from '../api'

export function DeskPage() {
  const [message, setMessage] = useState('Checking the desk…')

  useEffect(() => {
    api<{ ok: boolean; user: { email: string } }>('/admin')
      .then((body) => setMessage(`Signed in as ${body.user.email}. The sections on the left use the admin routes.`))
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'The API did not answer'))
  }, [])

  return (
    <section>
      <p className="eyebrow">Overview</p>
      <h1>Today’s desk</h1>
      <p>{message}</p>
    </section>
  )
}
