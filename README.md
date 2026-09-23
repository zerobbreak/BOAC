# Bokwidi Old Age Centre (BOAC) — Digital Platform
## INSY7315 Task 2: UI/UX & Content Architecture Deliverables
### Assigned Member: Bokamoso Sebake (BK — ST10440322) | UI/UX Lead & Content Architect

> **Motto:** *Batšofe Tiang Maatla – The elderly guide our strength*  
> **Community:** Extension 2, Diepsloot, Gauteng (Serving 800+ vulnerable households across 5 zones)

---

## 📁 Repository Structure & Deliverables

```text
├── docs/
│   ├── information-architecture.md   # Task 1.3: Site hierarchy, navigation taxonomy, user journeys & accessibility
│   ├── cms-content-model.md          # Task 1.3: Shared Headless CMS schema, Supabase entity models & POPIA compliance
│   └── wireframes.md                 # Task 2.1: Multi-breakpoint responsive wireframe specifications (Mobile, Tablet, Desktop)
├── wireframes/
│   └── interactive-preview.html      # Interactive wireframe prototype with responsive breakpoint switchers
└── README.md                         # Project index and architecture overview
```

---

## 📋 Task Breakdown & Status

| Task ID | Deliverable Description | Phase | Assigned To | Status |
| :---: | :--- | :---: | :---: | :---: |
| **1.3** | **Information Architecture & Shared Content Model for CMS** | Phase 1: Discovery & Planning | **Bokamoso Sebake** | ✅ **Complete** |
| **2.1** | **Wireframes — Website (Mobile, Tablet & Desktop Breakpoints)** | Phase 2: UI/UX Design | **Bokamoso Sebake** | ✅ **Complete** |
| **2.2** | Visual Design — Responsive Website | Phase 2: UI/UX Design | Bokamoso Sebake | ⏳ Next Phase |
| **6.2** | Final Content Goes Live | Phase 6: Launch | Bokamoso Sebake | ⏳ Future Phase |
| **7.1** | Admin Dashboard Training for BOAC Staff | Phase 7: Handover & Training | Unathi Tshuma & Bokamoso | ⏳ Future Phase |

---

## 🔍 Key Architectural Highlights

### 1. [Information Architecture (Task 1.3)](docs/information-architecture.md)
* **Public Portal**: Complete navigation hierarchy for Home, About, 7 Core Programmes, Media & Press, Photo Gallery, Get Involved, POPIA-Compliant Volunteer Intake, 1-Tap Donate, and Youth Opportunity Hub.
* **Coordinator CMS Portal**: Secured operational workflows for managing multimedia content, publishing community stories, tracking the 5-stage volunteer status pipeline (`Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Contacted` $\rightarrow$ `Accepted`/`Declined`), and maintaining live impact statistics.
* **Elderly-First Accessibility (WCAG 2.1 AA)**: Minimum contrast ratio of 4.5:1, $\ge 44\text{px}$ touch targets, explicit labels, and multi-language/clear font scaling for low-literacy and elderly community members.

### 2. [Shared Content Model for CMS (Task 1.3)](docs/cms-content-model.md)
* **Unified Supabase / PostgreSQL Schema**: 14 interconnected domain entities linking Public Web, Mobile App (React Native Expo), and Coordinator CMS.
* **POPIA Data Governance**: Strict data minimization, encrypted PII storage, row-level security (RLS) policies, and consent tracking for volunteer and community enquiries.
* **Static Bank Donation Safeguard**: Isolated banking detail entity eliminating third-party card processing to remove PCI-DSS liability.

### 3. [Responsive Wireframes System (Task 2.1)](docs/wireframes.md)
* **3 Viewport Breakpoints Specified**:
  * 📱 **Mobile** (`< 768px`, Base: 390px — 4-column grid, persistent accessible action bar)
  * 💻 **Tablet** (`768px – 1024px`, Base: 820px — 8-column grid, master-detail splits)
  * 🖥️ **Desktop** (`> 1024px`, Base: 1440px — 12-column grid, full multi-pane layout)
* **All Key Pages Wireframed**: Home, About, 7 Programmes, Volunteer Application Form, 1-Tap Donate Card, Media Archive, and CMS Coordinator Dashboard.

### 4. [Interactive Wireframes Prototype](wireframes/interactive-preview.html)
* High-fidelity structural prototype built in HTML5/CSS3/JavaScript.
* Interactive real-time viewport switcher between **Mobile (390px)**, **Tablet (820px)**, and **Desktop (1440px)** with live screen navigation.

---

## 👥 Project Team
* **Unathi Tshuma (ST10377293)** — *Project Lead, Backend API & Cloud Deployment*
* **Bokamoso Sebake (ST10440322)** — *UI/UX Lead, System Architecture & Data Modeling*
* **Muziwakhe Radebe (ST10371548)** — *Frontend Web Lead (Next.js / Tailwind CSS)*
* **Jordan Harding (ST10439633)** — *Mobile App Lead (React Native Expo) & Forms*
* **Oratile Mwase (ST10440606)** — *Quality Assurance, Testing & DevOps Verification*
