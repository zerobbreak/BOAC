import { Link, NavLink, Outlet } from 'react-router-dom'

const publicLinks = [
  ['/get-involved', 'Get Involved'],
  ['/volunteer-form', 'Volunteer'],
  ['/donate', 'Donate'],
  ['/contact', 'Contact'],
] as const

export function PublicLayout() {
  return (
    <div>
      <header className="public-nav">
        <Link to="/get-involved" className="mark">BOAC</Link>
        <nav>
          {publicLinks.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {label}
            </NavLink>
          ))}
          <Link to="/login">Sign in</Link>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <p className="muted">Batsofe Tiang Maatla — The elderly guide our strength</p>
        <p className="muted">Bokwidi Village, Waterberg District, Limpopo</p>
        <p className="muted">© {new Date().getFullYear()} Bokwidi Old Age Centre. Non-Profit Registered.</p>
      </footer>
    </div>
  )
}
