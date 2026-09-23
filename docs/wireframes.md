# Bokwidi Old Age Centre (BOAC) — Website Wireframe Specifications (Task 2.1)
**Author:** Bokamoso Sebake (BK — ST10440322 | UI/UX Lead)  
**Module:** INSY7315 Information System 3E (Task 2)  
**Client:** Bokwidi Old Age Centre (BOAC), Extension 2, Diepsloot, Gauteng  
**Deliverable:** Multi-breakpoint responsive wireframe system across Mobile, Tablet & Desktop  

---

## 1. Responsive Grid & Breakpoint Specifications

| Breakpoint Tier | Viewport Width | Columns | Margin | Gutter | Primary Navigation Pattern | Accessibility Targets |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| 📱 **Mobile** | `< 768px` (Base: 390px) | 4 | 16px | 12px | Sticky Accessible Header + Full-screen Overlay Drawer + Bottom Quick Action Bar | Min touch target $\ge 48\text{px}$, font $\ge 16\text{px}$ |
| 💻 **Tablet** | `768px – 1024px` (Base: 820px) | 8 | 24px | 16px | Sticky Header with grouped navigation + 2-Column Responsive Card Grids | Touch target $\ge 44\text{px}$, high-contrast text |
| 🖥️ **Desktop** | `> 1024px` (Base: 1440px) | 12 | 32px | 24px | Sticky Global App Bar with 1-Tap Donate Button + 3/4-Column Grids + Sidebar for CMS | Clean keyboard navigation (`Tab`), WCAG AAA headings |

---

## 2. Brand Identity & Visual Design Foundations

* **Primary Deep Navy**: `#0F2A4A` (Represents stability, institutional trust, and dignity)
* **Warm Amber / Gold**: `#E69500` / `#F59E0B` (Represents sunshine, warmth, and vitality for elders)
* **Sage Herb Green**: `#2E7D32` (Represents horticulture, community gardens, and nutritional feeding)
* **Soft Cream Canvas**: `#FDFBF7` (High readability background reducing glare for elderly readers)
* **Body Text Contrast**: `#1F2937` on `#FDFBF7` (Contrast ratio $> 11:1$, far exceeding WCAG AA requirements)
* **Typography**:
  * Headings: `Space Grotesk` / `Outfit` (Bold, welcoming, highly legible)
  * Body Text: `Inter` / `Source Sans Pro` (16px–18px base size with 1.6 line height)

---

## 3. Screen-by-Screen Structural Wireframes

---

### Screen 1: Home / Landing Page
Features the central mission, verified impact counters, 7 core programmes overview, and 1-tap giving.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+---------------------------------------------------------------------------------------------------+
| [ BOAC LOGO ]  Home   About   7 Programmes v   Media   Youth Hub   Contact       [ ❤️ DONATE NOW ]|
+---------------------------------------------------------------------------------------------------+
| HERO SECTION                                                                                      |
|   "Batšofe Tiang Maatla — The Elderly Guide Our Strength"                                         |
|   Empowering 800+ vulnerable households across 5 community zones in Diepsloot Extension 2.       |
|                                                                                                   |
|   [ 🤝 Become a Volunteer ]         [ 📋 View Our 7 Programmes ]          [ 💳 1-Tap Banking Info]|
+---------------------------------------------------------------------------------------------------+
| AUDITED COMMUNITY IMPACT METRICS                                                                  |
| +--------------------+ +--------------------+ +--------------------+ +---------------------------+|
| | 800+ Households    | | 5 Community Zones  | | 60+ Age Eligibility| | 3,200 Meals / Month      ||
| | Supported monthly  | | Across Diepsloot   | | Priority welfare   | | Hot nutritional feeding ||
| +--------------------+ +--------------------+ +--------------------+ +---------------------------+|
+---------------------------------------------------------------------------------------------------+
| OUR 7 COMMUNITY PILLARS                                                                           |
| [ 🍲 Nutritional Feeding ]  [ 👵 Elderly Day Care ]  [ 🌿 Community Farming ]  [ 🩺 Health Screen]|
| [ 📖 Adult Literacy ]       [ 🧑‍🤝‍🧑 Youth Mentorship ] [ 🏺 Cultural Heritage ]                          |
+---------------------------------------------------------------------------------------------------+
| TESTIMONIALS FROM OUR ELDERS                                                                      |
| "BOAC has given us a second home where our stories are heard and our health is cared for."         |
| — Mma Joyce, Community Elder (Zone 2)                                                             |
+---------------------------------------------------------------------------------------------------+
| FOOTER: NPO Reg: 2024/091823/08 | Extension 2, Diepsloot | Tel: +27 11 823 4900 | [Coordinator Login]|
+---------------------------------------------------------------------------------------------------+
```

#### 📱 Mobile Layout (`< 768px`)
```text
+-----------------------------------+
| [ BOAC Logo ]               [ ☰ ] |
+-----------------------------------+
| "The Elderly Guide Our Strength"  |
| Serving 800+ households in        |
| Diepsloot Extension 2.            |
|                                   |
| [ ❤️ DONATE VIA EFT (1-TAP) ]     |
| [ 🤝 VOLUNTEER WITH US ]          |
+-----------------------------------+
| COMMUNITY IMPACT:                 |
| • 800+ Households Supported       |
| • 5 Community Zones in Diepsloot  |
| • 3,200 Monthly Meals Served      |
+-----------------------------------+
| 7 CORE PROGRAMMES:                |
| > 🍲 Nutritional Feeding Scheme   |
| > 👵 Elderly Day Care & Wellness  |
| > 🌿 Community Agriculture        |
| > 🩺 Mobile Health Screenings     |
| > 📖 Adult Literacy Classes       |
| > 🧑‍🤝‍🧑 Youth Mentorship Hub       |
| > 🏺 Cultural Heritage & Stories  |
+-----------------------------------+
| ELDER IMPACT STORY:               |
| "BOAC is our sanctuary and family"|
| — Ntate Molapo, Zone 4            |
+-----------------------------------+
| [ 📞 Call Center ] [ 💬 WhatsApp ] |
+-----------------------------------+
| [ ❤️ Quick Donate ] [ 🤝 Volunteer ]|
+-----------------------------------+
```

---

### Screen 2: 1-Tap Donate & Banking Details Card
Provides transparent, fee-free direct EFT details with a single-tap copy action and clear impact breakdown.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+---------------------------------------------------------------------------------------------------+
| [< Back to Home]  Direct Bank Transfer / Donations                              [ Help Helpline ] |
+-------------------------------------------------+-------------------------------------------------+
| LEFT PANE: Verified Banking Information Card    | RIGHT PANE: How Your Contribution Helps         |
| +---------------------------------------------+ |                                                 |
| | 🏛️ First National Bank (FNB)                | | 🍲 R250 = Feeds an elder daily for one month    |
| |                                             | |                                                 |
| | Account Holder: Bokwidi Old Age Centre NPC  | | 🌿 R500 = Seeds and compost for community garden|
| | Account Number: 62894102934                 | |                                                 |
| | Account Type:   PBO Cheque Account          | | 🩺 R1,000 = Mobile wellness clinic supplies     |
| | Branch Code:    250655                      | |                                                 |
| | Swift Code:     FIRNZAJJ                    | | ---------------------------------------------   |
| | Reference:      [Your Name] - Donation      | | 🛡️ Transparent Governance:                      |
| +---------------------------------------------+ | All funds go directly to registered NPO         |
|                                                 | operations in Diepsloot Extension 2.            |
| [ 📋 CLICK TO COPY ALL BANKING DETAILS ]       | No credit card gateway processing fees!         |
| (Shows green confirmation toast upon copy)     |                                                 |
+-------------------------------------------------+-------------------------------------------------+
```

#### 📱 Mobile Layout (`< 768px`)
```text
+-----------------------------------+
| [<] Donate to BOAC                |
+-----------------------------------+
| Official Banking Details (FNB):   |
|                                   |
| Bank:      First National Bank    |
| Name:      Bokwidi Old Age Centre |
| Account:   62894102934            |
| Branch:    250655                 |
| Type:      Cheque Account         |
| Ref:       Your Name              |
|                                   |
| [ 📋 COPY BANK DETAILS (1-TAP) ]  |
|                                   |
| WHAT YOUR DONATION DOES:          |
| • R250: 1 Month Nutritious Meals  |
| • R500: Seeds for Garden Program  |
| • R1,000: Health Screening Kits   |
+-----------------------------------+
```

---

### Screen 3: POPIA-Compliant Volunteer Application Portal
Structured intake form with clear accessibility labels, area of interest selection, and explicit POPIA consent.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+---------------------------------------------------------------------------------------------------+
| [ BOAC ]  Join Our Volunteer Family in Diepsloot                                  [ Call Office ] |
+---------------------------------------------------------------------------------------------------+
| 4-STEP APPLICATION PROCESS:                                                                       |
| (1) Submit Application  --->  (2) Staff Review  --->  (3) Friendly Interview  ---> (4) Orientation|
+-------------------------------------------------+-------------------------------------------------+
| SECTION 1: Personal Contact Info                | SECTION 2: Skills & Service Area                |
| Full Name:                                      | Primary Area of Interest:                       |
| [ e.g. Thabo Ndlovu                           ] | [ v Kitchen & Meal Distribution Scheme        ] |
| Email Address:                                  |                                                 |
| [ thabo@email.com                             ] | Availability:                                   |
| Phone Number (WhatsApp Enabled):                | [ v Weekends / Saturdays (9am - 1pm)          ] |
| [ 082 123 4567                                ] |                                                 |
| Community Zone in Diepsloot:                    | Relevant Skills / Experience:                   |
| [ v Extension 2 (Local)                       ] | [ Describe cooking, gardening, or care exp... ] |
+-------------------------------------------------+-------------------------------------------------+
| POPIA DATA PROTECTION & CONSENT DECLARATION:                                                      |
| [X] I hereby give consent to Bokwidi Old Age Centre to process my contact information solely for  |
|     volunteer placement and vetting in accordance with the Protection of Personal Information Act.|
|                                                                                                   |
| [ 🚀 SUBMIT MY VOLUNTEER APPLICATION ]                                                            |
+---------------------------------------------------------------------------------------------------+
```

---

### Screen 4: 7 Core Programmes Hub
Dedicated landing showcasing all community welfare pillars with descriptions and direct support actions.

#### 💻 Tablet Layout (`768px – 1024px`)
```text
+-----------------------------------------------------------------------------------+
| [ BOAC ]  Our 7 Core Community Programmes                           [ ☰ Menu ]    |
+-----------------------------------------------------------------------------------+
| 2-COLUMN ADAPTIVE CARD GRID                                                       |
| +---------------------------------------+ +---------------------------------------+
| | 🍲 1. Cooking & Nutritional Feeding   | | 👵 2. Elderly Support & Day Care      |
| | Serving daily hot balanced meals to   | | Daily companionship, physical welfare |
| | 800+ vulnerable residents and elders. | | monitoring, and cognitive activities. |
| | [ View Meal Schedule & Menu ]         | | [ Learn More About Day Care ]         |
| +---------------------------------------+ +---------------------------------------+
| +---------------------------------------+ +---------------------------------------+
| | 🌿 3. Horticulture & Farming          | | 🩺 4. Community Wellness & Health     |
| | Organic vegetable cultivation providing| | Free blood pressure, glucose tests,  |
| | food security and practical training. | | and clinic escort services.           |
| | [ Explore Community Gardens ]         | | [ View Wellness Days Schedule ]       |
| +---------------------------------------+ +---------------------------------------+
+-----------------------------------------------------------------------------------+
```

---

### Screen 5: Coordinator CMS Dashboard & Volunteer Pipeline
Operational admin portal for reviewing incoming applications and publishing multimedia content.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+---------------------------------------------------------------------------------------------------+
| [ BOAC COORDINATOR PORTAL ] | Diepsloot Ext 2 Admin Hub                      [ Coordinator: Bok ] |
+-------------------+-------------------------------------------------------------------------------+
| NAVIGATION        | VOLUNTEER APPLICATION INTAKE PIPELINE                                         |
| • Dashboard       | Status Filter: [ All (18) ] [ New (5) ] [ Under Review (4) ] [ Accepted (9) ] |
| • Volunteer Queue +-------------------------------------------------------------------------------+
| • Programmes      | APPLICANT NAME   | ZONE   | AREA OF INTEREST   | SUBMITTED | STATUS   | ACTION    |
| • Media & News    |------------------+--------+--------------------+-----------+----------+-----------|
| • Photo Gallery   | Thabo Ndlovu     | Zone 2 | Kitchen & Feeding  | 2 hrs ago | [ NEW ]  | [Review >]|
| • Youth Hub       | Sindi Khumalo    | Zone 1 | Organic Farming    | Yesterday | [REVIEW] | [Review >]|
| • Site Stats      | Peter Sithole    | Zone 4 | Elderly Transport  | 3 days ago| [CONTACT]| [Review >]|
| • Settings        +-------------------------------------------------------------------------------+
|                   | POP-UP REVIEW MODAL: Update Status -> [ Accepted v ] | Add Note: [ Verified ] |
+-------------------+-------------------------------------------------------------------------------+
```
