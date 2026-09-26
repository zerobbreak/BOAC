import { useId, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export const communities = ['Bokwidi', 'Maolaeng', 'Ga-Molapo', 'Ga-Matlapa', 'Thulwane', 'Ga-Selepe']

// The triangle band after the painted (litema) walls of the region.
export function LitemaBand() {
  // useId's value holds characters that are awkward inside url(#…), so keep only safe ones.
  const id = `litema-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg className="band" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width="56" height="28" patternUnits="userSpaceOnUse">
          <rect width="56" height="28" fill="#8A3A22" />
          <path d="M0 28 L14 0 L28 28 Z" fill="#D8A03E" />
          <path d="M28 0 L42 28 L56 0 Z" fill="#231D19" />
        </pattern>
      </defs>
      <rect width="100%" height="28" fill={`url(#${id})`} />
    </svg>
  )
}

export function ArrowIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

// Text on the left, a photo filling the right; the photo moves on top on a phone.
export function SplitHero({
  kicker,
  title,
  image,
  alt,
  page = true,
  children,
}: {
  kicker: string
  title: ReactNode
  image: string
  alt: string
  page?: boolean
  children?: ReactNode
}) {
  return (
    <section className={page ? 'hero hero-page' : 'hero'}>
      <div className="hero-text">
        <p className="kicker">{kicker}</p>
        <h1 className={page ? 'page-title' : 'display'}>{title}</h1>
        {children}
      </div>
      <img src={image} alt={alt} className="hero-image" />
    </section>
  )
}

// The six villages as stops on one line.
export function VillageLine({ light = false }: { light?: boolean }) {
  return (
    <ol className={light ? 'villages villages-light' : 'villages'} aria-label="Villages we serve">
      {communities.map((name) => (
        <li key={name}><span className="village-dot" aria-hidden="true" />{name}</li>
      ))}
    </ol>
  )
}

export function QuoteBand({ image, alt }: { image: string; alt: string }) {
  return (
    <section className="quote-band">
      <figure className="quote-inner wrap reveal">
        <img src={image} alt={alt} />
        <blockquote>“The measure of a community’s soul is found in how it treats its elders.”</blockquote>
      </figure>
    </section>
  )
}

const helpRoutes = [
  { to: '/donate', title: 'Give money', text: 'A bank transfer pays for meals, health care and programmes.' },
  { to: '/volunteer', title: 'Give time', text: 'Cook, drive, garden or keep someone company. Apply online.' },
  { to: '/contact?subject=donation', title: 'Give things', text: 'Mobility aids, medical supplies, food parcels and warm clothing.' },
]

export function HelpRows() {
  return (
    <div className="rows">
      {helpRoutes.map((route, index) => (
        <Link key={route.title} to={route.to} className="row-link">
          <span className="row-num">{index + 1}</span>
          <span className="row-title">{route.title}</span>
          <span className="row-text">{route.text}</span>
          <span className="row-arrow"><ArrowIcon /></span>
        </Link>
      ))}
    </div>
  )
}
