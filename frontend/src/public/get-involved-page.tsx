import { Link } from 'react-router-dom'

export function GetInvolvedPage() {
  return (
    <section>
      <p className="eyebrow">Bokwidi Old Age Centre</p>
      <h1>Get Involved</h1>

      <div className="panel" style={{ marginTop: '1.4rem' }}>
        <h2>150+ active community members making a daily impact.</h2>
        <p className="muted">
          Every day, volunteers, partners, and donors help us uplift the elders of Bokwidi Village.
        </p>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Ways to Support</h2>
      <div className="cards">
        <article className="card">
          <h3>Volunteer</h3>
          <p>
            Share your time and skills. From helping with daily activities to leading workshops, your presence
            brings immense joy and value to our elders.
          </p>
          <Link className="button" to="/volunteer-form">Join as Volunteer →</Link>
        </article>
        <article className="card">
          <h3>Partner With Us</h3>
          <p>
            Corporate and community partnerships are vital. Let’s collaborate on initiatives that create
            sustainable impact for the Bokwidi community.
          </p>
          <Link className="button" to="/contact?subject=partnership">Partnership Enquiry →</Link>
        </article>
        <article className="card">
          <h3>Donate Resources</h3>
          <p>
            We welcome in-kind donations such as medical supplies, mobility aids, food parcels, and comfortable
            clothing for our residents.
          </p>
          <Link className="button" to="/contact?subject=donation">Resource Enquiry →</Link>
        </article>
      </div>

      <h2 style={{ marginTop: '2rem' }}>The Journey of Giving Back</h2>
      <div className="cards">
        <div className="panel">
          <h3>1. Reach Out</h3>
          <p>Choose your path — volunteer, partner, or donate — and submit a quick enquiry.</p>
        </div>
        <div className="panel">
          <h3>2. Connect</h3>
          <p>Our team contacts you to align your skills or resources with our current needs.</p>
        </div>
        <div className="panel">
          <h3>3. Impact</h3>
          <p>Join the community and see the direct, warm impact on the elders of Bokwidi.</p>
        </div>
      </div>
    </section>
  )
}
