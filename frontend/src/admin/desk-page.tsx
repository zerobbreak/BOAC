import { useQuery } from '@tanstack/react-query'
import { errorText } from '../lib/api-client'
import { adminDeskQuery } from './queries'

export function DeskPage() {
  const { data, error, isPending } = useQuery(adminDeskQuery)

  return (
    <section>
      <p className="eyebrow">Overview</p>
      <h1>Today’s desk</h1>
      <p>
        {isPending
          ? 'Checking the desk…'
          : error
            ? errorText(error, 'The API did not answer')
            : `Signed in as ${data?.user.email}. The sections on the left use the admin routes.`}
      </p>
    </section>
  )
}
