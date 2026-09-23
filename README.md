# VEX — AI Prompt Library & Developer Platform
## Task 2: UI/UX & Content Architecture Deliverables (BK — Bokamoso Sebake)

This repository contains the official UI/UX design, Information Architecture, Shared CMS Content Modeling, and Responsive Wireframe specifications for **VEX (AI Prompt Library)** developed for PROG7314 / INSY7315.

---

## 📁 Repository Structure & Deliverables

```text
├── docs/
│   ├── information-architecture.md   # Task 1.3: Site hierarchy, navigation taxonomy, user journeys
│   ├── cms-content-model.md          # Task 1.3: Shared headless CMS schema, relationships & field types
│   └── wireframes.md                 # Task 2.1: Structural wireframes for Desktop, Tablet & Mobile
├── wireframes/
│   └── interactive-preview.html      # Interactive breakpoint wireframe viewer (Mobile / Tablet / Desktop)
└── README.md                         # Project overview & navigation index
```

---

## 🚀 Key Deliverables Summary

### 1. [Information Architecture (Task 1.3)](docs/information-architecture.md)
* **Sitemap & Taxonomy**: Hierarchical mapping of Public Web, Prompt Studio & Sandbox, Community Hub, and CMS Admin Portal.
* **Global Navigation System**: Responsive navigation schema (Top App Bar & Sidebar on Desktop, Collapsible Drawer on Tablet, Bottom Navigation Bar on Mobile).
* **User Flow Diagrams**: Detailed journey maps for prompt creation, variable injection, dual-model comparison, and template publishing.

### 2. [Shared Content Model for CMS (Task 1.3)](docs/cms-content-model.md)
* **Omnichannel Schema**: Unified content modeling serving both the Android client and Responsive Web platform.
* **Entity Definitions**: Detailed field definitions for `User`, `Prompt`, `PromptVersion`, `PromptTemplate`, `Category`, `Tag`, `ModelRun`, `ModelProvider`, `CommunityPost`, `Vote`, and `CMSAuditLog`.
* **JSON-LD / OpenAPI Representations**: Production-ready data models and relational integrity rules (Cascade deletions, LWW timestamp sync).

### 3. [Responsive Wireframes (Task 2.1)](docs/wireframes.md)
* **Breakpoints Covered**:
  * 📱 **Mobile**: `< 768px` (375px–428px viewport, 4-column grid, persistent bottom nav)
  * 💻 **Tablet**: `768px – 1024px` (8-column grid, adaptive split-pane master-detail)
  * 🖥️ **Desktop**: `> 1024px` (1440px canvas, 12-column grid, dual-pane comparative diff engine)
* **Core Screens Specified**:
  1. Landing & Discovery Portal
  2. Prompt Studio & Smart Variable Injector
  3. Side-by-Side Dual Model Comparison Sandbox
  4. Response History & Latency Analytics
  5. Curated Community Template Marketplace
  6. CMS Admin & Moderation Console

### 4. [Interactive Wireframes Prototype](wireframes/interactive-preview.html)
* Self-contained interactive responsive prototype built with HTML5, CSS3, and JavaScript.
* Includes real-time viewport toggling between **Mobile (390px)**, **Tablet (820px)**, and **Desktop (1440px)**.

---

## 👥 Contributor
* **Bokamoso Sebake (BK)** — *UI/UX Design Lead & Content Architect*
