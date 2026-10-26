import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { errorText } from '../lib/api-client'
import { adminDeskQuery, applicationsQuery, contentQuery, messagesQuery, opportunitiesQuery } from './queries'

// What needs the admin today. Each count reuses the query its page already makes, so opening the
// page afterwards is instant.
export function DeskPage() {
  const desk = useQuery(adminDeskQuery)
  const content = useQuery(contentQuery)
  const applications = useQuery(applicationsQuery)
  const messages = useQuery(messagesQuery)
  const opportunities = useQuery(opportunitiesQuery)

  const posts = content.data?.content ?? []
  const published = posts.filter((item) => item.status === 'published')
  const onHome = published.filter((item) => item.placement === 'home')
  const toReview = (applications.data?.applications ?? []).filter((item) => item.status === 'submitted' || item.status === 'under_review')
  const unread = (messages.data?.messages ?? []).filter((item) => item.status === 'new')
  const open = (opportunities.data?.opportunities ?? []).filter((item) => item.status === 'open')
  const count = (loading: boolean, value: number) => (loading ? '…' : String(value))

  const tiles = [
    { to: '/desk/content', value: count(content.isPending, posts.length - published.length), label: 'Drafts not published', note: 'Only visible on the desk' },
    { to: '/desk/applications', value: count(applications.isPending, toReview.length), label: 'Applications to review', note: 'New or being reviewed' },
    { to: '/desk/messages', value: count(messages.isPending, unread.length), label: 'New messages', note: 'From the contact form' },
    { to: '/desk/opportunities', value: count(opportunities.isPending, open.length), label: 'Open opportunities', note: 'Shown on the volunteer form when public' },
  ]
  const error = desk.error ?? content.error ?? applications.error ?? messages.error ?? opportunities.error

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Today’s desk</h1>
        </div>
        <Link to="/desk/content?edit=new" className="button">Write a news post</Link>
      </div>
      {desk.data ? <p className="muted">Signed in as {desk.data.user.email}.</p> : null}
      {error ? <p className="error">{errorText(error, 'Some counts could not be loaded')}</p> : null}

      <div className="tiles">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className="tile">
            <span className="tile-count">{tile.value}</span>
            <span className="tile-label">{tile.label}</span>
            <span className="hint">{tile.note}</span>
          </Link>
        ))}
      </div>

      <h2>On the public site now</h2>
      <div className="list">
        <div className="card">
          <strong>Homepage · From the centre</strong>
          {onHome.length ? (
            <ol>{onHome.slice(0, 3).map((item) => <li key={item.id}><Link to={`/desk/content?edit=${item.id}`}>{item.title}</Link></li>)}</ol>
          ) : (
            <p className="muted">No posts featured, so the section is hidden. Choose “News page + Homepage” in a post to show one.</p>
          )}
        </div>
        <div className="card">
          <strong>News page</strong>
          <p className="muted">{published.length === 1 ? '1 published post' : `${published.length} published posts`}.</p>
        </div>
      </div>
    </section>
  )
}
