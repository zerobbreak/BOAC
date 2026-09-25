import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { authClient } from './auth'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { AssignPage } from './pages/AssignPage'
import { ContentPage } from './pages/ContentPage'
import { DeskPage } from './pages/DeskPage'
import { LoginPage } from './pages/LoginPage'
import { OpportunitiesPage } from './pages/OpportunitiesPage'
import { TaxonomyPage } from './pages/TaxonomyPage'

const links = [
  ['/', 'Desk'],
  ['/content', 'Content'],
  ['/library', 'Library'],
  ['/opportunities', 'Opportunities'],
  ['/applications', 'Applications'],
  ['/assign', 'Assign'],
] as const

function Shell() {
  const { data, isPending } = authClient.useSession()
  const navigate = useNavigate()
  if (isPending) return <p className="main">Opening the desk…</p>
  if (!data) return <Navigate to="/login" replace />
  if (data.user.role !== 'admin') {
    return <p className="main">This desk is for an admin account.</p>
  }

  return (
    <div className="shell">
      <aside className="nav">
        <p className="eyebrow">BOAC</p>
        <p className="mark">Desk</p>
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
        <p className="muted">{data.user.email}</p>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<DeskPage />} />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/library" element={<TaxonomyPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/assign" element={<AssignPage />} />
        </Routes>
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
