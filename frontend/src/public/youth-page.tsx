import { Link } from 'react-router-dom'
import { ArrowIcon, LitemaBand, SplitHero } from './sections'
import programmeYouth from './images/programme-youth.webp'

const pillars = [
  ['Leadership training', 'Confident, community-minded leaders, built through workshops, projects and real problems to solve.'],
  ['Creative expression', 'Writing, storytelling, art and drama that celebrate local culture while building communication skills.'],
  ['Income generation', 'Practical entrepreneurship and money skills for economic independence.'],
] as const

export function YouthPage() {
  return (
    <>
      <SplitHero kicker="Youth development" title="The next generation, raised by the last." image={programmeYouth} alt="Young people in a workshop at the centre">
        <p className="lede">
          Mentorship, skills training and leadership — young people from across the Waterberg learning alongside our
          elders.
        </p>
        <div className="actions">
          <Link to="/volunteer" className="btn btn-clay">Join the programme</Link>
          <Link to="/contact" className="btn btn-line">Ask a question</Link>
        </div>
      </SplitHero>

      <LitemaBand />

      <section className="dark section">
        <div className="wrap">
          <dl className="facts" style={{ borderTop: 0, paddingTop: 0 }}>
            <div><dt>Youth enrolled</dt><dd>120+</dd></div>
            <div><dt>Workshops each month</dt><dd>8</dd></div>
            <div><dt>Completion rate</dt><dd>95%</dd></div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid-2">
          <h2 className="section-title reveal">Leaders from within the community</h2>
          <div className="prose reveal">
            <p>
              Young people come to BOAC not just to learn, but to connect, grow and give back. Structured workshops in
              leadership, creative writing, entrepreneurship and life skills give them tools for a lifetime.
            </p>
            <p>
              Most importantly, each participant is paired with one of our elders — a bond of wisdom, mentorship and
              mutual respect that neither side forgets.
            </p>
          </div>
        </div>
      </section>

      <section className="deep section">
        <div className="wrap">
          <h2 className="section-title reveal" style={{ marginBottom: 40 }}>Three pillars</h2>
          <div className="rows">
            {pillars.map(([title, text], index) => (
              <Link key={title} to="/contact" className="row-link">
                <span className="row-num">{index + 1}</span>
                <span className="row-title">{title}</span>
                <span className="row-text">{text}</span>
                <span className="row-arrow"><ArrowIcon /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid-2">
          <h2 className="section-title reveal">Invest in our youth.</h2>
          <div className="stack reveal">
            <p className="lede">Every contribution to the youth programme ripples across generations.</p>
            <div className="actions">
              <Link to="/donate" className="btn btn-clay">Give to the centre</Link>
              <Link to="/volunteer" className="btn btn-line">Volunteer</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
