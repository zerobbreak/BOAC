import { useEffect, useState } from 'react'
import { api } from '../api'
import { place, when, type VolunteerDashboard, type WorkItem } from './volunteer'

export function VolunteerFormPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    area: "",
    skills: "",
    availability: "",
    motivation: "",
    consent: false,
  });

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm({ ...form, [key]: value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Volunteer Application Submitted:", form);
    alert("Application submitted!");
  }

  return (
    <div className="main">
      <h1 className="mark">Volunteer With Us</h1>
      <p className="eyebrow">Bokwidi Old Age Centre</p>

      <div className="split" style={{ marginTop: "1.4rem" }}>
        {/* LEFT SIDE */}
        <div>
          <blockquote className="panel">
            <p className="muted">
              “The measure of a community’s soul is found in how it treats its elders.”
            </p>
          </blockquote>

          <h2>How It Works</h2>
          <div className="list">
            <div className="card">
              <h3>1. Apply Online</h3>
              <p>Fill out the form to let us know your interests and availability.</p>
            </div>
            <div className="card">
              <h3>2. Brief Interview</h3>
              <p>We’ll chat to find the perfect fit for your skills.</p>
            </div>
            <div className="card">
              <h3>3. Start Helping</h3>
              <p>Join orientation and begin making a difference in Bokwidi.</p>
            </div>
          </div>

          <h2 style={{ marginTop: "2rem" }}>Areas You Can Help</h2>
          <div className="list">
            <div className="card">Health & Care</div>
            <div className="card">Meal Prep</div>
            <div className="card">Event Planning</div>
            <div className="card">Gardening</div>
            <div className="card">Transport</div>
            <div className="card">Companionship</div>
          </div>
        </div>

        {/* RIGHT SIDE — FORM */}
        <form className="panel" onSubmit={handleSubmit}>
          <h2>Application Form</h2>

          <label>
            <span>First Name</span>
            <input
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
          </label>

          <label>
            <span>Last Name</span>
            <input
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </label>

          <label>
            <span>Email Address</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </label>

          <label>
            <span>Phone Number</span>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
          </label>

          <label>
            <span>Area of Interest</span>
            <select
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              required
            >
              <option value="">Select an area to help with…</option>
              <option>Health & Care</option>
              <option>Meal Prep</option>
              <option>Event Planning</option>
              <option>Gardening</option>
              <option>Transport</option>
              <option>Companionship</option>
            </select>
          </label>

          <label>
            <span>Relevant Skills & Experience</span>
            <textarea
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
            />
          </label>

          <label>
            <span>Availability</span>
            <textarea
              value={form.availability}
              onChange={(e) => update("availability", e.target.value)}
            />
          </label>

          <label>
            <span>Why do you want to volunteer with BOAC?</span>
            <textarea
              value={form.motivation}
              onChange={(e) => update("motivation", e.target.value)}
            />
          </label>

          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => update("consent", e.target.checked)}
              required
            />
            <span className="muted">
              I consent to BOAC storing my application data for volunteer coordination.
            </span>
          </label>

          <button type="submit">Submit Application ▶</button>
        </form>
      </div>
    </div>
  );
}
