import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useScrollReveal } from '../public/motion'
import { LitemaBand } from '../public/sections'
import logo from '../public/images/boac-logo.webp'
import '../public/site.css'

const siteLinks = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/programmes', 'Programmes'],
  ['/youth', 'Youth'],
  ['/media', 'News'],
  ['/get-involved', 'Get involved'],
  ['/contact', 'Contact'],
] as const

export function PublicLayout() {
  const { pathname, hash } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLElement>(null)
  useScrollReveal(root)

  // A new page starts at the top, as it would on a full page load; a #hash goes to that section.
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (event: MouseEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="site" ref={root}>
      <header ref={header} className={scrolled || menuOpen ? 'site-header is-scrolled' : 'site-header'}>
        <div className="site-header-inner wrap">
          <Link to="/" className="logo" onClick={closeMenu}>
            <img src={logo} alt="Bokwidi Old Age Centre — home" />
          </Link>
          <nav className="main-nav" aria-label="Main">
            {siteLinks.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <Link to="/login" className="staff-link" aria-label="Staff sign in" title="Staff sign in">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
              </svg>
            </Link>
            <Link to="/donate" className="btn btn-clay" onClick={closeMenu}>Give</Link>
            <button
              type="button"
              className="menu-button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                {menuOpen ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
        <nav id="mobile-menu" className={menuOpen ? 'mobile-menu wrap is-open' : 'mobile-menu wrap'} aria-label="Main">
          {siteLinks.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={closeMenu}>{label}</NavLink>
          ))}
          <NavLink to="/login" onClick={closeMenu}>Staff sign in</NavLink>
          <Link to="/volunteer" className="btn btn-line" onClick={closeMenu}>Volunteer with us</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <LitemaBand />
        <div className="footer-grid wrap">
          <div>
            <p className="footer-name">Bokwidi Old Age Centre</p>
            <p className="footer-muted">Bokwidi Village, Waterberg District, Limpopo</p>
            <p className="footer-muted" lang="nso">Batšofe tiang maatla — the elderly guide our strength</p>
          </div>
          <div>
            <p className="footer-label">Visit</p>
            <p>Mon–Fri, 08:00–16:00</p>
            <p className="footer-muted">Closed weekends</p>
          </div>
          <div>
            <p className="footer-label">Get in touch</p>
            <ul>
              <li><a href="tel:+27151234567">+27 (0)15 123 4567</a></li>
              <li><a href="mailto:info@bokwidioldagecentre.org.za">Email us</a></li>
              <li><Link to="/contact">Contact form</Link></li>
            </ul>
          </div>
          <div>
            <p className="footer-label">Help out</p>
            <ul>
              <li><Link to="/donate">Give money</Link></li>
              <li><Link to="/volunteer">Volunteer</Link></li>
              <li><Link to="/login">Staff sign in</Link></li>
            </ul>
          </div>
        </div>
        <p className="footer-base wrap">© {new Date().getFullYear()} Bokwidi Old Age Centre · Registered non-profit organisation</p>
      </footer>
    </div>
  )
}
