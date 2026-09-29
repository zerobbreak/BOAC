import { Link } from 'react-router-dom'
import { LitemaBand, SplitHero, VillageLine } from './sections'
import aboutHero from './images/about-hero.webp'

const principles = [
  ['Dignity', 'Treating every elder with the greatest respect, honouring their life journey in every way.'],
  ['Community', 'Fostering a sense of belonging that brings elders and youth together as one growing family.'],
  ['Compassion', 'Bringing care and empathy to every interaction, programme and decision.'],
  ['Empowerment', 'Encouraging elders to take an active part in the decisions that shape their community.'],
] as const

export function AboutPage() {
  return (
    <>
      <SplitHero kicker="About BOAC" title="Rooted in respect and heritage." image={aboutHero} alt="A community gathering at Bokwidi">
        <p className="lede">
          A registered non-profit in the heart of the Waterberg District, driven by respect for the generations who
          paved the way for us.
        </p>
      </SplitHero>

      <LitemaBand />

      <section className="section">
        <div className="wrap grid-2">
          <h2 className="section-title reveal">Who we are</h2>
          <div className="prose reveal">
            <p>
              The Bokwidi Old Age Centre (BOAC) is a place of care and company in Bokwidi Village, Limpopo. Growing
              old can bring isolation, poor health and money worries; BOAC was set up to meet those with a steady
              stream of care, dignity and encouragement.
            </p>
            <p>
              We believe that ageing should not mean fading into the background, but stepping into the respected role
              of community elder.
            </p>
          </div>
        </div>
      </section>

      <section className="dark section">
        <div className="wrap statements">
          <div className="statement reveal">
            <h3>Our mission</h3>
            <p>
              To improve the lives of elders in Bokwidi and the surrounding villages through care, nutrition, health
              advocacy, and programmes that keep them included and well.
            </p>
          </div>
          <div className="statement reveal">
            <h3>Our vision</h3>
            <p>
              A community where every elder lives with dignity, is valued for their wisdom, and enjoys their later
              years surrounded by support.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head reveal">
            <h2 className="section-title">What guides us</h2>
            <p className="lede">Four beliefs behind our daily work, our programmes and our plans for the centre.</p>
          </div>
          <div className="grid-2">
            {principles.map(([title, text], index) => (
              <div key={title} className="numbered reveal">
                <span className="row-num">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="deep section">
        <div className="wrap">
          <div className="section-head reveal">
            <h2 className="section-title">Our home is Bokwidi.</h2>
            <p className="lede">
              A village of strong bonds and rich history. Working here means support reaches elders without taking
              them away from the land and people they love.
            </p>
          </div>
          <VillageLine light />
          <div className="actions reveal">
            <Link to="/donate" className="btn btn-clay">Give to the centre</Link>
            <Link to="/volunteer" className="btn btn-line">Volunteer with us</Link>
          </div>
        </div>
      </section>
    </>
  )
}
