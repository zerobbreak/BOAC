import { NavLink, Navigate, useNavigate } from 'react-router-dom'
import { AdminRoutes, adminLinks } from '../admin/admin-routes'
import { VolunteerRoutes, volunteerLinks } from '../volunteer/volunteer-routes'
import { authClient } from '../lib/auth'
import { queryClient } from '../lib/query-client'

// The signed-in desk: admins and volunteers share the URLs, and the role picks which pages they map to.
export function Shell() {
  const { data, isPending } = authClient.useSession()
  const navigate = useNavigate()
  if (isPending) return <p className="main">Opening the desk…</p>
  if (!data) return <Navigate to="/login" replace />
  const role = data.user.role
  if (role !== 'admin' && role !== 'volunteer') {
    return <p className="main">This desk is for an admin or volunteer account.</p>
  }
  const links = role === 'admin' ? adminLinks : volunteerLinks

  return (
    <div className="shell">
      <aside className="nav">
        <p className="eyebrow">BOAC</p>
        <p className="mark">{data.user.name}</p>
        <p className="muted">{data.user.email}</p>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : undefined)}>
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
      </aside>
      <main className="main">
        {role === 'admin' ? <AdminRoutes /> : <VolunteerRoutes />}
      </main>
    </div>
  )
}
