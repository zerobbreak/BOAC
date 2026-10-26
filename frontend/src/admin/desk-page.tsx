import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'
import { Link } from 'react-router-dom'
import { client, errorText } from '../lib/api-client'
import { MediaCard, fallbackImages } from '../public/media-parts'
import { comingUp, onVolunteerForm, overdue, pastClosing } from './dates'
import { applicationsQuery, assignmentsQuery, categoriesQuery, contentQuery, messagesQuery, opportunitiesQuery } from './queries'
import { useCover } from './use-cover'
import '../public/site.css'

type ContentItem = InferResponseType<typeof client.admin.content.$get, 200>['content'][number]

// How many drafts and shifts the desk shows before linking to the full page.
const previewCount = 3

function shiftTime(value: string | null) {
  if (!value) return 'No start time'
  return new Date(value).toLocaleString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// What needs the admin today. Each count reuses the query its page already makes, so opening the
// page afterwards is instant.
export function DeskPage() {
  const content = useQuery(contentQuery)
  const categories = useQuery(categoriesQuery)
  const applications = useQuery(applicationsQuery)
  const messages = useQuery(messagesQuery)
  const opportunities = useQuery(opportunitiesQuery)
  const assignments = useQuery(assignmentsQuery)

  const posts = content.data?.content ?? []
  const published = posts.filter((item) => item.status === 'published')
  const onHome = published.filter((item) => item.placement === 'home')
  const drafts = posts
    .filter((item) => item.status === 'draft')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const categoryName = new Map((categories.data ?? []).map((category) => [category.id, category.name]))
  const toReview = (applications.data?.applications ?? []).filter((item) => item.status === 'submitted' || item.status === 'under_review')
  const unread = (messages.data?.messages ?? []).filter((item) => item.status === 'new')
  const allOpportunities = opportunities.data?.opportunities ?? []
  const listed = allOpportunities.filter(onVolunteerForm)
  // Still open here but already gone from the volunteer form, so nobody can apply.
  const expired = allOpportunities.filter((item) => item.status === 'open' && pastClosing(item))
  const shifts = assignments.data ?? []
  const nextShifts = shifts.filter((item) => comingUp(item) && item.startsAt).slice(0, previewCount)
  const late = shifts.filter(overdue)

  // A failed count shows a dash, never a 0 that looks like "nothing to do".
  const count = (query: { isPending: boolean; isError: boolean }, value: number) =>
    query.isError ? '—' : query.isPending ? '…' : String(value)

  const tiles = [
    { to: '/desk/content', value: count(content, drafts.length), label: 'Drafts not published', note: 'Only visible on the desk' },
    { to: '/desk/applications', value: count(applications, toReview.length), label: 'Applications to review', note: 'New or being reviewed' },
    { to: '/desk/messages', value: count(messages, unread.length), label: 'New messages', note: 'From the contact form' },
    { to: '/desk/opportunities', value: count(opportunities, listed.length), label: 'Taking applications', note: 'Listed on the volunteer form now' },
  ]
  const error = content.error ?? applications.error ?? messages.error ?? opportunities.error ?? assignments.error

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Today’s desk</h1>
        </div>
        <Link to="/desk/content?edit=new" className="button">Write a news post</Link>
      </div>
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

      {expired.length || late.length ? (
        <div className="desk-alerts" role="status">
          {expired.length ? (
            <p className="notice">
              {expired.length === 1
                ? `${expired[0].title} is past its closing date but still open, so nobody can apply. `
                : `${expired.length} opportunities are past their closing date but still open, so nobody can apply. `}
              <Link to="/desk/opportunities">Close or extend {expired.length === 1 ? 'it' : 'them'}</Link>
            </p>
          ) : null}
          {late.length ? (
            <p className="notice">
              {late.length === 1 ? '1 shift has started but is not marked done. ' : `${late.length} shifts have started but are not marked done. `}
              <Link to="/desk/assign">See overdue shifts</Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="toolbar">
        <h2>Drafts in progress</h2>
        {drafts.length > previewCount ? <Link to="/desk/content">All {drafts.length} drafts</Link> : null}
      </div>
      {content.isPending ? <p className="muted">Loading…</p> : null}
      {content.data && drafts.length === 0 ? (
        <p className="muted desk-empty">No drafts. <Link to="/desk/content?edit=new">Write a news post</Link> and it shows here until you publish it.</p>
      ) : null}
      {drafts.length ? (
        <>
          <p className="muted page-intro">How each draft will look on the News page. Open one to keep writing or publish it.</p>
          <div className="site site-embed desk-drafts">
            <div className="media-grid">
              {drafts.slice(0, previewCount).map((item, index) => (
                <DraftPreview key={item.id} item={item} category={item.categoryId ? categoryName.get(item.categoryId) : undefined} index={index} />
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div className="toolbar">
        <h2>Coming up</h2>
        <Link to="/desk/assign">All shifts</Link>
      </div>
      {assignments.isPending ? <p className="muted">Loading…</p> : null}
      {assignments.data && nextShifts.length === 0 ? (
        <p className="muted desk-empty">No shifts booked. <Link to="/desk/assign">Assign a volunteer</Link> to put one on their Schedule.</p>
      ) : null}
      {nextShifts.length ? (
        <div className="table-box">
          <table>
            <thead>
              <tr><th>When</th><th>Volunteer</th><th>Work</th><th>Where</th></tr>
            </thead>
            <tbody>
              {nextShifts.map((item) => (
                <tr key={item.id}>
                  <td>{shiftTime(item.startsAt)}</td>
                  <td>{item.volunteerName}</td>
                  <td>{item.title}</td>
                  <td>{item.location ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <h2>On the public site now</h2>
      <div className="list">
        <div className="card">
          <div className="toolbar">
            <strong>Homepage · From the centre</strong>
            <a href="/" target="_blank" rel="noreferrer">View homepage</a>
          </div>
          {onHome.length ? (
            <ol>{onHome.slice(0, previewCount).map((item) => <li key={item.id}><Link to={`/desk/content?edit=${item.id}`}>{item.title}</Link></li>)}</ol>
          ) : (
            <p className="muted">No posts featured, so the section is hidden. Choose “News page + Homepage” in a post to show one.</p>
          )}
        </div>
        <div className="card">
          <div className="toolbar">
            <strong>News page</strong>
            <a href="/media" target="_blank" rel="noreferrer">View News page</a>
          </div>
          <p className="muted">{published.length === 1 ? '1 published post' : `${published.length} published posts`}.</p>
        </div>
      </div>
    </section>
  )
}

// A draft as its News card will look, linking back to the editor.
function DraftPreview({ item, category, index }: { item: ContentItem; category?: string; index: number }) {
  const cover = useCover(item)
  return (
    <MediaCard
      title={item.title}
      body={item.body}
      category={category}
      date={item.updatedAt}
      image={cover ?? fallbackImages[index % fallbackImages.length]}
      to={`/desk/content?edit=${item.id}`}
    />
  )
}
