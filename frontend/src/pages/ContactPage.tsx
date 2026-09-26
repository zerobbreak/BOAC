import { useEffect, useState } from 'react'
import { api } from '../api'
import { place, when, type VolunteerDashboard, type WorkItem } from './volunteer'

export function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm({ ...form, [key]: value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Contact Form Submitted:", form);
    alert("Message sent!");
  }

  return (
    <div className="main">
      <h1 className="mark">Contact Us</h1>
      <p className="eyebrow">Bokwidi Old Age Centre</p>

      <div className="split" style={{ marginTop: "1.4rem" }}>
        {/* LEFT SIDE — LOCATION INFO */}
        <div className="panel">
          <h2>Our Location</h2>

          <p><strong>Address:</strong><br />Bokwidi Village, Waterberg District, Limpopo, South Africa</p>
          <p><strong>Phone:</strong><br />+27 (0)15 123 4567</p>
          <p><strong>Email:</strong><br />info@bokwidioldagecentre.org.za</p>
          <p><strong>Hours:</strong><br />Mon–Fri: 08:00–16:00<br />Weekends: Closed</p>

          <div style={{ marginTop: "1rem" }}>
            <img
              src="/assets/map-bokwidi.png"
              alt="Map of Bokwidi Village"
              style={{ width: "100%", border: "1px solid var(--ink)" }}
            />
          </div>
        </div>

        {/* RIGHT SIDE — CONTACT FORM */}
        <form className="panel" onSubmit={handleSubmit}>
          <h2>Send Us a Message</h2>

          <label>
            <span>Full Name</span>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
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
            <span>Phone Number (Optional)</span>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </label>

          <label>
            <span>Subject</span>
            <select
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
            >
              <option>General Inquiry</option>
              <option>Volunteer</option>
              <option>Donation</option>
              <option>Partnership</option>
            </select>
          </label>

          <label>
            <span>Message</span>
            <textarea
              placeholder="How can we help you today?"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              required
            />
          </label>

          <button type="submit">Send Message</button>
        </form>
      </div>

      {/* FOOTER */}
      <footer style={{ marginTop: "3rem" }}>
        <p className="muted">
          Batsofe Tiang Maatla — The elderly guide our strength
        </p>
        <p className="muted">Bokwidi Village, Waterberg District, Limpopo</p>

        <div className="row">
          <a href="/volunteer">Volunteer</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/reports">Annual Reports</a>
        </div>

        <p className="muted" style={{ marginTop: "1rem" }}>
          © 2024 Bokwidi Old Age Centre. All rights reserved.<br />
          Non-Profit Registered
        </p>
      </footer>
    </div>
  );
}
