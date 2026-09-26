import { useEffect, useRef } from 'react'
import { Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AdminRoutes, adminLinks } from '../admin/admin-routes'
import { VolunteerRoutes, volunteerLinks } from '../volunteer/volunteer-routes'
import { authClient } from '../lib/auth'
import { queryClient } from '../lib/query-client'
import { LitemaBand } from '../public/sections'
import logo from '../public/images/boac-logo.webp'

// The signed-in desk: admins and volunteers share the URLs, and the role picks which pages they map to.
export function Shell() {
  const { data, isPending } = authClient.useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const deskNav = useRef<HTMLElement>(null)

  // On a phone the links are one sideways-scrolling row; keep the current page's link in view.
  useEffect(() => {
    deskNav.current?.querySelector('.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [pathname, data])

  if (isPending) return <div className="desk"><p className="main">Opening the desk…</p></div>
  if (!data) return <Navigate to="/login" replace />
  const role = data.user.role
  if (role !== 'admin' && role !== 'volunteer') {
    return <div className="desk"><p className="main">This desk is for an admin or volunteer account.</p></div>
  }
  const links = role === 'admin' ? adminLinks : volunteerLinks

  return (
    <div className="desk shell">
      <aside className="nav">
        <Link to="/" className="desk-logo">
          <img src={logo} alt="Bokwidi Old Age Centre — public site" />
        </Link>
        <p className="eyebrow">{role === 'admin' ? 'Admin desk' : 'Volunteer desk'}</p>
        <p className="mark">{data.user.name}</p>
        <p className="muted">{data.user.email}</p>
        <nav ref={deskNav} aria-label="Desk">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/desk'} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          className="ghost"
          type="button"
          onClick={() => {
            void authClient.signOut().then(() => {
              // Drop cached data so the next person to sign in here never sees it.
              queryClient.clear()
              navigate('/login')
            })
          }}
        >
          Sign out
        </button>
        <Link to="/" className="site-link">View the public site</Link>
      </aside>
      <div className="desk-main">
        <LitemaBand />
        <main className="main">
          {role === 'admin' ? <AdminRoutes /> : <VolunteerRoutes />}
        </main>
      </div>
    </div>
  )
}
