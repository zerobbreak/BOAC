import { useEffect, useState } from 'react'
import { api } from '../api'
import { place, when, type VolunteerDashboard, type WorkItem } from './volunteer'

export function DonationPage() {
  const [copied, setCopied] = useState(false);

  const accountDetails = `
Bokwidi Old Age Centre
Standard Bank
Account Number: 123 456 789 0
Branch Code: 051 001
Reference: Your Name / Org
`;

  function copyDetails() {
    navigator.clipboard.writeText(accountDetails.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="main">
      <h1 className="mark">Support BOAC</h1>
      <p className="eyebrow">Empower Our Elders, Strengthen Our Community</p>

      {/* HERO */}
      <div className="split" style={{ marginTop: "1.4rem" }}>
        <img
          src="/assets/elder-smile.jpg"
          alt="Elderly person smiling"
          style={{ width: "100%", border: "1px solid var(--ink)" }}
        />

        <div className="panel">
          <h2>Your contribution directly impacts daily lives.</h2>
          <p className="muted">
            Every donation helps us provide nutritious meals, essential healthcare,
            and a safe, dignified environment for the elders of Bokwidi Village.
          </p>
        </div>
      </div>

      {/* WHY SUPPORT MATTERS */}
      <h2 style={{ marginTop: "2rem" }}>Why Your Support Matters</h2>

      <div className="list">
        <div className="card">
          <h3>Daily Nutrition</h3>
          <p>
            Balanced, culturally appropriate meals that help seniors maintain
            health and vitality.
          </p>
        </div>

        <div className="card">
          <h3>Healthcare Access</h3>
          <p>
            Regular check-ups, medication support, and specialized care for
            age-related conditions.
          </p>
        </div>

        <div className="card">
          <h3>Community Programs</h3>
          <p>
            Social activities, skills workshops, and mental well-being initiatives
            that prevent isolation.
          </p>
        </div>
      </div>

      {/* BANK TRANSFER DETAILS */}
      <h2 style={{ marginTop: "2rem" }}>Make a Bank Transfer</h2>

      <div className="panel">
        <p><strong>Account Name:</strong> Bokwidi Old Age Centre</p>
        <p><strong>Bank:</strong> Standard Bank</p>
        <p><strong>Account Number:</strong> 123 456 789 0</p>
        <p><strong>Branch Code:</strong> 051 001</p>
        <p><strong>Reference:</strong> Your Name / Org</p>

        <button onClick={copyDetails}>
          {copied ? "Copied!" : "Copy Account Details"}
        </button>
      </div>

      {/* ASSISTANCE */}
      <h2 style={{ marginTop: "2rem" }}>Need Assistance?</h2>

      <div className="card">
        <p>
          For corporate sponsorships, in-kind donations, or partnership enquiries,
          our team is ready to assist.
        </p>
        <a className="ghost" href="/contact">Contact Us →</a>
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
          © 2024 Bokwidi Old Age Centre. All rights reserved.  
          <br />
          Non-Profit Registered
        </p>
      </footer>
    </div>
  );
}
