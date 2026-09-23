# VEX — Website & Responsive Wireframe Specifications (Task 2.1)
**Author:** Bokamoso Sebake (BK — UI/UX Design Lead)  
**Project:** VEX AI Prompt Library (PROG7314 / INSY7315 Task 2)  
**Deliverable:** Multi-breakpoint responsive wireframe system  

---

## 1. Grid Systems & Breakpoint Definitions

| Breakpoint Tier | Viewport Width | Grid Columns | Margin | Gutter | Primary Navigation Pattern |
| :--- | :--- | :---: | :---: | :---: | :--- |
| 📱 **Mobile** | `< 768px` (Base: 390px) | 4 | 16px | 12px | Persistent Bottom Navigation Bar (56px) + Floating Action Button (FAB) |
| 💻 **Tablet** | `768px – 1024px` (Base: 820px) | 8 | 24px | 16px | Collapsible Left Icon Rail (72px) + Split-Pane Master-Detail |
| 🖥️ **Desktop** | `> 1024px` (Base: 1440px) | 12 | 32px | 24px | Expanded Left Sidebar (240px) + Multi-column Workbench + Right Inspector |

---

## 2. Global Design Tokens & Typography Scale

* **Primary Background**: Ink Black `#09090B` / Slate Deep `#0F172A`
* **Surface / Cards**: Dark Charcoal `#1E293B` (Border: `#334155`)
* **Signature Accent**: Ember Orange `#F76301` → Magenta `#C6267B` → Deep Violet `#620093`
* **Telemetry & Highlights**: Neon Cyan `#00F5FF` / `#38BDF8`
* **Monospace Font (Prompts/Code)**: `JetBrains Mono` / `Fira Code` (14px/1.5)
* **UI Font**: `Inter` / `Space Grotesk` (12px to 32px)

---

## 3. Screen-by-Screen Structural Wireframes

---

### Screen 1: Authentication & Onboarding
Allows Google SSO, email/password entry, biometric unlock toggle, and offline bypass.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+-----------------------------------------------------------------------------------+
|  [ VEX LOGO >_ ]                                                    [ Help / Docs ]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|           +-------------------------------------------------------+               |
|           |                      VEX AI                           |               |
|           |          "Precision AI Prompt Engineering"            |               |
|           |                                                       |               |
|           |  +-------------------------------------------------+  |               |
|           |  | [G] Continue with Google SSO (Firebase Auth)    |  |               |
|           |  +-------------------------------------------------+  |               |
|           |                                                       |               |
|           |  ---------------------- OR -------------------------  |               |
|           |                                                       |               |
|           |  Email Address                                        |               |
|           |  [ user@domain.com                                  ] |               |
|           |  Password                                             |               |
|           |  [ ******************                              ] |               |
|           |                                                       |               |
|           |  +-------------------------------------------------+  |               |
|           |  | [ PRIMARY BUTTON: Sign In / Register ]          |  |               |
|           |  +-------------------------------------------------+  |               |
|           |                                                       |               |
|           |            [ -> Continue Offline (Local Cache) ]      |               |
|           +-------------------------------------------------------+               |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

#### 📱 Mobile Layout (`< 768px`)
```text
+-----------------------------------+
| [ VEX Logo >_ ]                   |
| Welcome to the void.              |
|                                   |
| [ G Continue with Google SSO ]    |
|                                   |
| ----------- OR -----------        |
|                                   |
| [ Email input box               ] |
| [ Password input box            ] |
|                                   |
| [ ACTION: Continue with Email ->] |
|                                   |
| [ Checkbox: Enable Biometrics ]   |
|                                   |
| [ Link: Continue Offline ]        |
+-----------------------------------+
```

---

### Screen 2: Prompt Library & Workspace (Home)
Faceted search, filter carousels, prompt cards with telemetry tags, and quick actions.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+-----------------------------------------------------------------------------------+
| [VEX >_] | [Search prompts, variables, tags... (Cmd+K)]       | [Sync: OK] [Avatar]|
+----------+----------------------------------------------------+-------------------+
| SIDEBAR  | CATEGORY CHIPS: [ All ] [ Coding (14) ] [ Marketing (8) ] [ Creative ]|
|          +------------------------------------------------------------------------+
| * Library| PROMPT CARDS (3-Column Responsive Grid)                                |
| - Coding | +------------------------+ +------------------------+ +---------------+|
| - Market | | SEO Blog Post Gen [..] | | Fast React Refactor[..]| | SQL Query Opt ||
| - Custom | | "Act as an SEO..."     | | "Refactor component..."| | "Optimize..." ||
|          | | Tags: #marketing #seo  | | Tags: #react #clean    | | Tags: #sql    ||
| * Studio | | Vars: {topic}, {tone}  | | Vars: {code}, {hook}   | | Vars: {schema}||
| * Comm.  | | Latency: 420ms | 98%   | | Latency: 310ms | 95%   | | Latency: 180ms||
| * Runs   | | [Run] [Edit] [Fork]    | | [Run] [Edit] [Fork]    | | [Run] [Edit]  ||
| * Sett.  | +------------------------+ +------------------------+ +---------------+||
|          |                                                                        |
|          | [+ Floating New Prompt Button]                                         |
+----------+------------------------------------------------------------------------+
```

#### 💻 Tablet Layout (`768px – 1024px`)
```text
+---+-------------------------------------------------------------------------------+
|[=]| [ Search prompts...                                       ] [ Sync: OK ] [Avt]|
+---+-------------------------------------------------------------------------------+
| R | Chips: [ All ] [ Coding ] [ Marketing ] [ Research ]                         |
| A +---------------------------------------+---------------------------------------+
| I | (Master List - 50% width)             | (Detail Preview Panel - 50% width)    |
| L | > SEO Blog Post Generator             | TITLE: SEO Blog Post Generator        |
|   |   Tags: #seo, #copy | 2 vars          | Variables: {topic}, {keywords}        |
| * | > React Component Refactoring         | Body Preview:                         |
| * |   Tags: #react, #hook | 1 var         | "Act as an expert SEO copywriter..."  |
| * | > Python Async Scraper                | Recent Runs: 3 | Avg Score: 96%       |
| * |   Tags: #python, #scraping            | [ RUN IN SANDBOX ]  [ EDIT PROMPT ]   |
+---+---------------------------------------+---------------------------------------+
```

#### 📱 Mobile Layout (`< 768px`)
```text
+-----------------------------------+
| VEX [Search prompts...      ] [👤]|
+-----------------------------------+
| [All] [Marketing] [Code] [Research|
+-----------------------------------+
| +-------------------------------+ |
| | SEO Optimized Blog Generator ⋮ | |
| | "Act as an expert SEO..."     | |
| | [Marketing]        2 vars  98%| |
| +-------------------------------+ |
| +-------------------------------+ |
| | React Component Refactoring  ⋮ | |
| | "Analyze the following..."    | |
| | [Code]             1 var   94%| |
| +-------------------------------+ |
|                                   |
|                           [( + )] |
+-----------------------------------+
| [📁 Lib]  [🌐 Comm]  [⚡ Run] [⚙️] |
+-----------------------------------+
```

---

### Screen 3: Prompt Studio & Smart Variable Injector
Real-time AST parsing of `{variables}` with inline syntax chips and dynamic input forms.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+-----------------------------------------------------------------------------------+
| [< Back to Lib]  Editing: "SEO Blog Post Generator"             [ Save ] [ Run > ]|
+-------------------------------------------------+---------------------------------+
| LEFT PANE: Prompt Authoring Canvas (65%)        | RIGHT PANE: Parameter Engine(35%|
|                                                 +---------------------------------+
| Title: [ SEO Blog Post Generator              ] | DETECTED VARIABLES (2):         |
| Category: [ Marketing v ] Tags: [seo, blog x]   |                                 |
|                                                 | 1. {topic}                      |
| PROMPT BODY EDITOR (JetBrains Mono 14px):       | [ Enter topic name...         ] |
| +---------------------------------------------+ |                                 |
| | You are an expert SEO copywriter. Write a   | | 2. {target_audience}            |
| | comprehensive 1500-word blog post about     | [ e.g. Senior Developers      ] |
| | @topic@.                                    |                                 |
| |                                             | ------------------------------- |
| | Ensure the tone is @tone@ throughout the    | TARGET MODEL PRESETS:           |
| | document and include practical examples.    | Model: [ GPT-4o Omni       v ]  |
| +---------------------------------------------+ | Temperature: [------o----] 0.7  |
| Tokens: ~120 | Words: 38 | Variables: 2       | Top P:       [--------o--] 0.9  |
+-------------------------------------------------+---------------------------------+
```

---

### Screen 4: Dual-Model Execution Sandbox & Split Comparison Diff
Dispatches prompt to two distinct models simultaneously with telemetry tracking.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+-----------------------------------------------------------------------------------+
| [< Studio] Sandbox Benchmark: "SEO Blog Post Generator"       [ RERUN ] [ EXPORT ]|
+-------------------------------------------------+---------------------------------+
| MODEL A: GPT-4o (OpenAI)                        | MODEL B: Gemini 1.5 Pro (Google)|
| Latency: 480ms | Tokens: 412 | Score: 98%       | Latency: 320ms | Tokens: 398 | 94%|
+-------------------------------------------------+---------------------------------+
| # Stream Output A                               | # Stream Output B               |
| Here is the comprehensive guide to AI Prompt    | In this in-depth walkthrough, we|
| Engineering for enterprise applications...      | explore modern prompt design... |
|                                                 |                                 |
| 1. Clear Instructions: Always specify roles     | * Key Principle 1: Role framing |
| 2. Parameter Injection: Leverage placeholders   | * Key Principle 2: Dynamic vars |
|                                                 |                                 |
| [ Copy Model A Output ]                         | [ Copy Model B Output ]         |
+-------------------------------------------------+---------------------------------+
| TELEMETRY DIFF: Gemini responded 160ms faster (-33%). GPT-4o scored higher in AST.|
+-----------------------------------------------------------------------------------+
```

#### 📱 Mobile Layout (`< 768px`)
```text
+-----------------------------------+
| [< Back] Sandbox Benchmark        |
+-----------------------------------+
| Model Tabs: [ * GPT-4o ] [ Gemini ]|
+-----------------------------------+
| Latency: 480ms | Tokens: 412      |
| Consistency Score: 98%            |
|                                   |
| >> OUTPUT:                        |
| Here is the comprehensive guide to|
| AI Prompt Engineering for teams...|
| 1. Clear Instructions             |
| 2. Parameter Injection            |
|                                   |
| [ 📋 Copy Output ]  [ 💾 Save Run ] |
|                                   |
| [ Tweak Parameters / Re-run ]     |
+-----------------------------------+
| [📁 Lib]  [🌐 Comm]  [⚡ Run] [⚙️] |
+-----------------------------------+
```

---

### Screen 5: Curated Community Feed & Template Marketplace
Browse public templates, view upvote counts, and one-click clone into personal workspaces.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+-----------------------------------------------------------------------------------+
| [VEX >_] | Community Marketplace & Discover Feed               [ + Submit Prompt ]|
+----------+------------------------------------------------------------------------+
| TABS     | [ 🔥 Trending Today ]  [ ✨ New Arrivals ]  [ 🏆 Staff Curated Picks ] |
| - All    +------------------------------------------------------------------------+
| - Code   | CARD 1: Full-Stack React Architecture     CARD 2: SQL Query Optimizer  |
| - Copy   | By: @neon_coder | Midjourney / GPT        By: @data_guru | Claude 3.5  |
| - DevOps | ▲ 1,420 Upvotes | 380 Clones              ▲ 940 Upvotes | 192 Clones   |
|          | "Generates clean TypeScript boilerplate"  "Analyzes query execution..."|
|          | [ 🚀 1-Click Clone to My Library ]        [ 🚀 1-Click Clone ]         |
+----------+------------------------------------------------------------------------+
```

---

### Screen 6: CMS Admin Portal & Moderation Console
For editorial staff and administrators to manage templates, categories, and model providers.

#### 🖥️ Desktop Layout (`> 1024px`)
```text
+-----------------------------------------------------------------------------------+
| [VEX CMS ADMIN] | Global System Health: ALL SYSTEMS OPERATIONAL      [Admin: Bok] |
+------------------+----------------------------------------------------------------+
| NAV MENU         | COMMUNITY MODERATION QUEUE (3 Pending Review)                  |
| - Dashboard      +----------------------------------------------------------------+
| * Moderation     | Submission: "Automated Pentest Prompt" by @sec_dev             |
| - Templates (CMS)| Model: GPT-4o | Category: Cybersecurity                        |
| - Taxonomies     | Safety Score: 99.2% (Passed OpenAI Moderation API)             |
| - Model Providers| Action: [ ✅ APPROVE & PUBLISH ]  [ ⚠️ REQUEST EDITS ]  [ ❌ REJECT]|
| - Audit Logs     +----------------------------------------------------------------+
|                  | ACTIVE MODEL PROVIDERS: OpenAI (v1), Google Gemini (v1beta)   |
+------------------+----------------------------------------------------------------+
```
