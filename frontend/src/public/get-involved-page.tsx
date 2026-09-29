import { Link } from 'react-router-dom'
import { ArrowIcon, LitemaBand, SplitHero } from './sections'
import donateHero from './images/donate-hero.webp'

const ways = [
  {
    to: '/volunteer',
    title: 'Volunteer',
    text: 'Share your time and skills — from helping with daily activities to leading a workshop.',
  },
  {
    to: '/contact?subject=partnership',
    title: 'Partner with us',
    text: 'Businesses and community groups: let’s build something lasting for Bokwidi together.',
  },
  {
    to: '/contact?subject=donation',
    title: 'Donate resources',
    text: 'Medical supplies, mobility aids, food parcels and warm clothing for our elders.',
  },
  {
    to: '/donate',
    title: 'Give money',
    text: 'A bank transfer pays for meals, health care and programmes.',
  },
]

const journey = [
  ['Reach out', 'Choose your path — volunteer, partner or donate — and send us a quick enquiry.'],
  ['Connect', 'Our team gets in touch to match your skills or resources to what we need now.'],
  ['See the impact', 'Join the community and see the difference, in person, with the elders of Bokwidi.'],
] as const

export function GetInvolvedPage() {
  return (
    <>
      <SplitHero kicker="Get involved" title="There’s a place for you here." image={donateHero} alt="An elder’s hands held in a volunteer’s">
        <p className="lede">
          More than 150 people from the community already give their time, skills or goods. Your contribution helps
          build a stronger, warmer home for the elders of Bokwidi.
        </p>
        <div className="actions">
          <Link to="/volunteer" className="btn btn-clay">Become a volunteer</Link>
        </div>
      </SplitHero>

      <LitemaBand />

      <section className="section">
        <div className="wrap">
          <h2 className="section-title reveal" style={{ marginBottom: 40 }}>Ways to help</h2>
          <div className="rows">
            {ways.map((way, index) => (
              <Link key={way.title} to={way.to} className="row-link">
                <span className="row-num">{index + 1}</span>
                <span className="row-title">{way.title}</span>
                <span className="row-text">{way.text}</span>
                <span className="row-arrow"><ArrowIcon /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="dark section">
        <div className="wrap">
          <div className="section-head reveal">
            <h2 className="section-title">What happens next</h2>
            <p className="lede">How your involvement turns into real, lasting change for our elders.</p>
          </div>
          <div className="statements statements-3">
            {journey.map(([title, text], index) => (
              <div key={title} className="statement reveal">
                <h3>Step {index + 1}</h3>
                <p>{title}</p>
                <p className="statement-text">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
