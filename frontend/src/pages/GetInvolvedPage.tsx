import { useEffect, useState } from 'react'
import { api } from '../api'
import { place, when, type VolunteerDashboard, type WorkItem } from './volunteer'


export function GetInvolvedPage() {
  return (
    <div className="main">
      <h1 className="mark">Get Involved</h1>
      <p className="eyebrow">Bokwidi Old Age Centre</p>

      {/* HERO */}
      <div className="split" style={{ marginTop: "1.4rem" }}>
        <img
          src="/assets/community.jpg"
          alt="Community"
          style={{ width: "100%", border: "1px solid var(--ink)" }}
        />

        <div className="panel">
          <h2>150+ Active community members making a daily impact.</h2>
          <p className="muted">
            Every day, volunteers, partners, and donors help us uplift the elders
            of Bokwidi Village.
          </p>
        </div>
      </div>

      {/* WAYS TO SUPPORT */}
      <h2 style={{ marginTop: "2rem" }}>Ways to Support</h2>

      <div className="list">
        <div className="card">
          <h3>Volunteer</h3>
          <p>
            Share your time and skills. From helping with daily activities to
            leading workshops, your presence brings immense joy and value to our
            elders.
          </p>
          <a className="ghost" href="/volunteer">Join as Volunteer →</a>
        </div>

        <div className="card">
          <h3>Partner With Us</h3>
          <p>
            Corporate and community partnerships are vital. Let’s collaborate on
            initiatives that create sustainable impact for the Bokwidi community.
          </p>
          <a className="ghost" href="/partner">Partnership Enquiry →</a>
        </div>

        <div className="card">
          <h3>Donate Resources</h3>
          <p>
            We welcome in-kind donations such as medical supplies, mobility aids,
            food parcels, and comfortable clothing for our residents.
          </p>
          <a className="ghost" href="/resources">Resource Enquiry →</a>
        </div>
      </div>

      {/* JOURNEY */}
      <h2 style={{ marginTop: "2rem" }}>The Journey of Giving Back</h2>

      <div className="split">
        <div className="panel">
          <h3>1. Reach Out</h3>
          <p>Choose your path—volunteer, partner, or donate—and submit a quick enquiry.</p>
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
    </div>
  );
}
