import { Link } from 'react-router-dom'
import { HelpRows, LitemaBand, QuoteBand, SplitHero, VillageLine } from './sections'
import aboutHero from './images/about-hero.webp'
import heroElder from './images/hero-elder.webp'
import programmeLearning from './images/programme-learning.webp'
import programmeSkills from './images/programme-skills.webp'
import programmeYouth from './images/programme-youth.webp'

export function HomePage() {
  return (
    <>
      <SplitHero
        page={false}
        kicker="Bokwidi Village · since 2019"
        title={<span lang="nso">Batšofe tiang maatla.</span>}
        image={aboutHero}
        alt="Elders and neighbours gathered outside the centre in Bokwidi"
      >
        <p className="translation">The elderly guide our strength.</p>
        <p className="lede">
          A day centre in the Waterberg where anyone over sixty finds a meal, a health check and good company — and
          where young people come to learn from them.
        </p>
        <div className="actions">
          <Link to="/donate" className="btn btn-clay">Give to the centre</Link>
          <Link to="/volunteer" className="btn btn-line">Volunteer</Link>
        </div>
      </SplitHero>

      <LitemaBand />

      <section className="dark section">
        <div className="wrap">
          <div className="section-head reveal">
            <h2 className="section-title">Six villages. One centre.</h2>
            <p className="lede">
              We go to where our elders live, so nobody has to leave the land and people they love to be cared for.
            </p>
          </div>
          <VillageLine />
          <dl className="facts">
            <div><dt>Who can come</dt><dd>Anyone aged 60+</dd></div>
            <div><dt>When we’re open</dt><dd>Mon–Fri, 08:00–16:00</dd></div>
            <div><dt>Where</dt><dd>Bokwidi Village, Limpopo</dd></div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-title reveal" style={{ marginBottom: 40 }}>What happens here</h2>
          <div className="programmes">
            <article className="programme-feature reveal">
              <img src={programmeSkills} alt="Elders working together at a craft table" />
              <h3>Care &amp; wellness</h3>
              <p style={{ maxWidth: 600 }}>
                Daily meals, health screenings, light exercise and time in the garden — planned around each elder, not
                a timetable.
              </p>
              <Link to="/programmes#care" className="text-link">How elderly care works</Link>
            </article>
            <div className="programme-side">
              <article className="programme-mini reveal">
                <img src={programmeYouth} alt="Young people in a workshop at the centre" />
                <div>
                  <h3>Youth &amp; mentorship</h3>
                  <p>Leadership, writing and earning skills — each young person paired with an elder mentor.</p>
                  <Link to="/youth" className="text-link">Youth programme</Link>
                </div>
              </article>
              <article className="programme-mini reveal">
                <img src={programmeLearning} alt="An adult learner reading with a facilitator" />
                <div>
                  <h3>Reading &amp; learning</h3>
                  <p>Reading, writing and phone skills for every age, at the learner’s own pace.</p>
                  <Link to="/programmes#literacy" className="text-link">Literacy classes</Link>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <QuoteBand image={heroElder} alt="Portrait of an elder in the community garden" />

      <section className="section">
        <div className="wrap">
          <h2 className="section-title reveal" style={{ marginBottom: 40 }}>Three ways to help</h2>
          <HelpRows />
        </div>
      </section>
    </>
  )
}
