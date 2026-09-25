import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { authClient } from './auth'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { AssignPage } from './pages/AssignPage'
import { ContentPage } from './pages/ContentPage'
import { DeskPage } from './pages/DeskPage'
import { LoginPage } from './pages/LoginPage'
import { OpportunitiesPage } from './pages/OpportunitiesPage'
import { TaxonomyPage } from './pages/TaxonomyPage'
import { VolunteerHomePage } from './pages/VolunteerHomePage'
import { VolunteerSpacesPage } from './pages/VolunteerSpacesPage'
import { VolunteerWorkPage } from './pages/VolunteerWorkPage'

const adminLinks = [
  ['/', 'Desk'],
  ['/content', 'Content'],
  ['/library', 'Library'],
  ['/opportunities', 'Opportunities'],
  ['/applications', 'Applications'],
  ['/assign', 'Assign'],
] as const

const volunteerLinks = [
  ['/', 'Schedule'],
  ['/work', 'Work'],
  ['/spaces', 'Spaces'],
] as const

function Shell() {
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
            void authClient.signOut().then(() => navigate('/login'))
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="main">
        {role === 'admin' ? (
          <Routes>
            <Route path="/" element={<DeskPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/library" element={<TaxonomyPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/assign" element={<AssignPage />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<VolunteerHomePage />} />
            <Route path="/work" element={<VolunteerWorkPage />} />
            <Route path="/spaces" element={<VolunteerSpacesPage />} />
          </Routes>
        )}
      </main>
    </div>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<Shell />} />
    </Routes>
  )
}
