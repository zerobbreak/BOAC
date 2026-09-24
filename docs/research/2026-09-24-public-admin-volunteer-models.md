# Public site + admin dashboard models (CMS & volunteer systems)

**Date:** 2026-09-24

Research notes from official documentation and first-party source: how mature systems separate public readers from staff, model draft/publish editorial content, and handle public volunteer applications reviewed by admins. Claims below cite the owning primary source. Where a source does not cover a topic, that gap is stated explicitly.

---

## 1. Public vs admin access

### WordPress — roles as named bundles of capabilities

WordPress treats a **user** as an access account with at least username, password, and email, stored in the `users` table ([Users](https://developer.wordpress.org/plugins/users/)). Users are assigned **roles**; each role has a **set of capabilities** ([Users](https://developer.wordpress.org/plugins/users/); [Roles and Capabilities (plugin handbook)](https://developer.wordpress.org/plugins/users/roles-and-capabilities/)).

- **Stored on the role (not as a free-form list on each user row):** role display name plus a capabilities map. Roles and their capabilities are stored under the `user_roles` option key ([Roles and Capabilities (plugin handbook)](https://developer.wordpress.org/plugins/users/roles-and-capabilities/)).
- **Authorization checks:** intended checks are capability-based (`current_user_can( $capability )` / `user_can()`), for both back-end and front-end privileged actions ([Roles and Capabilities (plugin handbook)](https://developer.wordpress.org/plugins/users/roles-and-capabilities/); [Checking User Capabilities](https://developer.wordpress.org/plugins/security/checking-user-capabilities/)).
- **Default roles** (six): Super Admin, Administrator, Editor, Author, Contributor, Subscriber. A role “defines a set of tasks”; capabilities are the task permissions (e.g. `publish_posts`, `edit_posts`). Contributors can write/manage their own posts but cannot publish them; Subscribers only manage their profile ([Roles and Capabilities (WordPress documentation)](https://wordpress.org/documentation/article/roles-and-capabilities/)).
- **Capability vs role name:** the official capability-vs-role table maps many named capabilities (not role labels) to each default role ([Roles and Capabilities (WordPress documentation)](https://wordpress.org/documentation/article/roles-and-capabilities/)).

WordPress does **not** document a separate “public site user table” vs “admin user table”; anonymous visitors simply lack a logged-in account and therefore lack staff capabilities. Least privilege is stated as giving only privileges essential for the work ([Users](https://developer.wordpress.org/plugins/users/)).

### Drupal — accounts, multiple roles, named permissions

From Drupal core API documentation (source tree):

- Visitors have **accounts** (username, email, password, optional fields). Anonymous users have an implicit account without real account information ([`core.api.php` user_api](https://git.drupalcode.org/project/drupal/-/raw/11.x/core/core.api.php)).
- Each account is assigned **one or more roles**. Anonymous automatically gets the anonymous role; real accounts automatically get authenticated, plus any additional assigned roles ([same source](https://git.drupalcode.org/project/drupal/-/raw/11.x/core/core.api.php)).
- Each role is granted **named permissions**. Access checks should answer “Does the current user have permission 'foo'?” — **nearly always at the permission level, not by checking a particular role or user ID** ([same source](https://git.drupalcode.org/project/drupal/-/raw/11.x/core/core.api.php)).

From the Drupal User Guide (official docs):

- Three visitor groups: anonymous, authenticated, and User 1 ([Concept: Users, Roles, and Permissions](https://www.drupal.org/docs/user_guide/en/user-concept.html)).
- Permissions name actions (e.g. “View published content”); roles group permissions; a user gets all permissions of assigned roles ([same page](https://www.drupal.org/docs/user_guide/en/user-concept.html)).
- User entity fields include `mail`, hashed `pass` (“The password of this user (hashed)”), and a multi-value `roles` entity reference ([`User.php` base fields](https://raw.githubusercontent.com/drupal/drupal/11.x/core/modules/user/src/Entity/User.php)).

So in Drupal: **user stores account identity + role references; permissions live on roles; authorization is a permission name list, not a single role label.**

### Payload CMS — auth collections + operation access control

- Auth-enabled collections inject `hash`, `salt`, and `email`; documents in that collection are “users” ([Authentication Overview](https://payloadcms.com/docs/authentication/overview/)).
- Access Control decides what a user can do and see in the Admin Panel; it can use the user, their **roles (RBAC)**, document data, etc. Functions are scoped to operations (`create`, `read`, `update`, `delete`, …) ([Access Control](https://payloadcms.com/docs/access-control/overview)).
- Default access is “user present on the request”; examples include public `read` of posts, or public `read` only where `status` equals `published`, and admin-only delete by `role` ([same page](https://payloadcms.com/docs/access-control/overview)).
- For drafts, Payload documents using `read` Access Control so unauthenticated users only retrieve `_status: 'published'` documents; logged-in users may retrieve all ([Drafts](https://payloadcms.com/docs/versions/drafts)).

Payload therefore separates **public** from **staff** by access functions (often checking login + optional role field + document `_status`), not by a second database product.

### Summary (access)

| System | On the user | On the role / elsewhere | Authz primitive |
|--------|-------------|-------------------------|-----------------|
| WordPress | Account + assigned role(s) | Role → capabilities map | Capability name |
| Drupal | Account + one or more role refs; hashed password | Role → permissions | Permission name |
| Payload | Auth collection fields (`email`, `hash`, `salt`, optional custom fields e.g. `role`) | Access Control functions | Operation access functions (may use role and/or field constraints) |

---

## 2. Content workflow (draft in admin → public site)

### WordPress — one `post` type family, statuses, taxonomies

Official Posts REST schema fields include: `status`, `type`, `title`, `content`, `author`, `categories`, `tags` ([Posts REST API](https://developer.wordpress.org/rest-api/reference/posts/)).

- **Status values documented on that schema:** `publish`, `future`, `draft`, `pending`, `private` ([same](https://developer.wordpress.org/rest-api/reference/posts/)). List endpoint defaults `status` to `publish` ([same](https://developer.wordpress.org/rest-api/reference/posts/)).
- **Author:** integer author ID on the post ([same](https://developer.wordpress.org/rest-api/reference/posts/)).
- **Category / tags:** terms in the `category` and `post_tag` taxonomies ([same](https://developer.wordpress.org/rest-api/reference/posts/); [`register_post_type` taxonomies](https://developer.wordpress.org/reference/functions/register_post_type/)).
- **One content type or many:** WordPress models content as **post types** (built-in and custom). `register_post_type` registers types that can support statuses, taxonomies, etc.; taxonomies such as `category` or `post_tag` attach via the `taxonomies` argument ([`register_post_type`](https://developer.wordpress.org/reference/functions/register_post_type/)). Posts and pages are different types sharing the posts infrastructure, not two unrelated tables in the public API model.

The REST schema does **not** invent separate “articles” vs “posts” tables; both would typically be post types or the built-in `post` type with taxonomies.

### Drupal — content types (bundles), published flag, optional workflows

- Nodes implement published state via `EntityPublishedInterface` (`isPublished` / `setPublished` / `setUnpublished`) ([`EntityPublishedInterface.php`](https://git.drupalcode.org/project/drupal/-/raw/11.x/core/lib/Drupal/Core/Entity/EntityPublishedInterface.php)).
- `NodeInterface` defines `NOT_PUBLISHED = 0` and `PUBLISHED = 1` ([`NodeInterface.php`](https://git.drupalcode.org/project/drupal/-/raw/11.x/core/modules/node/src/NodeInterface.php)).
- User Guide: each content item can be **Published or Unpublished**; viewing permissions differ for published vs unpublished (e.g. visitors see published; creators/editors see unpublished) ([Concept: Editorial Workflow](https://www.drupal.org/docs/user_guide/en/planning-workflow.html)).
- Core **Workflows** + **Content Moderation** add states/transitions beyond published/unpublished, with permissions on transitions ([same](https://www.drupal.org/docs/user_guide/en/planning-workflow.html)).
- Content structure: sites add **content types** (e.g. Vendor) with publishing options (Published, Promoted, Sticky, Create new revision) and optional display of author/date ([Adding a Content Type](https://www.drupal.org/docs/user_guide/en/structure-content-type.html)).

So Drupal: **many editorial shapes = many content types (bundles) on one node entity model**, with a boolean published state (and optional moderation states). The sources consulted do not define a separate parallel “posts” table and “articles” table as first-class core concepts.

### Payload — collections + `_status` draft/published

- Enabling drafts injects `_status` with values **`draft`** or **`published`** ([Drafts](https://payloadcms.com/docs/versions/drafts)).
- Admin UI can show Draft / Published / Changed; **Changed is a UI indication** when newer unpublished versions exist ([same](https://payloadcms.com/docs/versions/drafts)).
- Public APIs must combine `_status` with Access Control so drafts are not returned to unauthenticated users ([same](https://payloadcms.com/docs/versions/drafts)).
- Content shapes are **collections** (configurable fields), not a fixed posts/articles split ([Collections](https://payloadcms.com/docs/configuration/collections)). Author/category/tags are only present if the project defines those fields; the drafts docs do not prescribe those fields.

### Summary (content)

| Concern | WordPress | Drupal | Payload |
|---------|-----------|--------|---------|
| Draft/publish | `status` enum including `draft`, `pending`, `publish`, `private`, `future` | Published/unpublished (+ optional moderation states) | `_status`: `draft` \| `published` |
| Author | `author` user ID | Owner/author on content (User Guide display settings) | Only if modeled as a field |
| Category/tags | Taxonomies `category`, `post_tag` | Fields/taxonomies per content type (site-defined) | Site-defined fields |
| Posts vs articles | Post types / shared posts API | Content types on node | Separate collections if desired |

---

## 3. Volunteer / constituent applications

### CiviCRM contacts & activities (core)

- **Contacts** are the centre of the data model (Individuals, Organisations, Households) with names, emails, phones, addresses; other building blocks connect to contacts ([Contacts](https://docs.civicrm.org/user/en/latest/organising-your-data/contacts/)).
- **Activities** record interactions: date/time, duration, **status**, **added by**, **assigned to** (usually staff), **with contact(s)** (subjects of the activity) ([Activities](https://docs.civicrm.org/user/en/latest/organising-your-data/activities/)).
- **Default activity status options** documented: Scheduled, Completed, Cancelled, Left Message, Unreachable, Not Required; administrators can add more ([same](https://docs.civicrm.org/user/en/latest/organising-your-data/activities/)). These are **not** the same labels as “Submitted / Under Review / Contacted” unless a site customizes option groups.
- **Cases** group multiple activities for complex processes; they add case roles (e.g. Case Coordinator), timelines, and extra access control ([What You Need To Know (CiviCase)](https://docs.civicrm.org/user/en/latest/case-management/what-you-need-to-know/)). A structured application workflow *could* be modeled as a case type; the page describes case patterns (intake, follow-up) but does **not** define a dedicated “volunteer_applications” entity.

### Notes that stay private

On a contact’s Notes tab, notes are free-text. **“Author Only” privacy** means only the note’s author, or someone with **“view all notes”** permission (via the CMS), can view or edit it ([Contacts — Notes tab](https://docs.civicrm.org/user/en/latest/organising-your-data/contacts/)).

### CiviVolunteer (official extension docs)

CiviVolunteer documents volunteering more specifically than core CiviCRM alone:

- **Projects** compartmentalize volunteering; all volunteering info associates with a project ([Projects](https://docs.civicrm.org/volunteer/en/latest/projects/)).
- **Opportunities** (role + time + capacity; flags **Public** for self-signup and **Enabled** for staff assignment) belong under a project ([Opportunities](https://docs.civicrm.org/volunteer/en/latest/opportunities/)).
- **Assignment** “links a CiviCRM contact to a **specific volunteering opportunity**” ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/)).
- **Who the applicant is:**
  - Self-service signup for **anonymous and/or authenticated** users (with permissions `CiviVolunteer: register to volunteer` and `CiviCRM: access AJAX API`) ([Sign-up form](https://docs.civicrm.org/volunteer/en/latest/sign-up-form/)).
  - Signup creates an **assignment** (and confirmation email; managers BCC’d) ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/); [Projects — Manager](https://docs.civicrm.org/volunteer/en/latest/projects/)).
  - Profiles collect form questions (contact fields / custom fields); group registration can register others ([Projects](https://docs.civicrm.org/volunteer/en/latest/projects/); [Custom data](https://docs.civicrm.org/volunteer/en/latest/custom-data/)).
  - Staff can manually assign contacts ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/)).
- **General interest without an opportunity:** Volunteer Interest Form lets the public express interest **without signing up for a specific opportunity** ([Interest form](https://docs.civicrm.org/volunteer/en/latest/interest-form/); also listed under features in [Introduction](https://docs.civicrm.org/volunteer/en/latest/)).
- **Reviewer / staff side:** project **Owner** / **Manager** relationships; Managers are BCC’d on signup confirmations; assignments are **activities** visible on the contact Activities tab, with staff assignment UI ([Projects](https://docs.civicrm.org/volunteer/en/latest/projects/); [Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/)).
- **Tied to opportunity?** Yes for assignments; optional “Any” shift / Available Volunteers list when configured; interest form is explicitly **not** opportunity-specific ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/); [Interest form](https://docs.civicrm.org/volunteer/en/latest/interest-form/)).

CiviVolunteer docs consulted do **not** prescribe an application status enum named Submitted / Under Review / Contacted. Activity status options from core Activities apply when assignments are stored as activities; exact volunteer-specific status labels beyond that are not spelled out on the pages above.

---

## 4. What stays private vs what is safe to expose publicly

Findings limited to what the cited sources state:

| Data / concern | Sources say |
|----------------|-------------|
| **Password / hash** | WordPress users have a password as part of the account ([Users](https://developer.wordpress.org/plugins/users/)). Drupal stores password as hashed (`pass` field description: “hashed”) ([`User.php`](https://raw.githubusercontent.com/drupal/drupal/11.x/core/modules/user/src/Entity/User.php)). Payload injects `hash` and `salt`; treat stored format as internal ([Authentication Overview](https://payloadcms.com/docs/authentication/overview/)). None of these docs present hashes as public API content. |
| **Draft / unpublished content** | WordPress list posts default to `status=publish` ([Posts REST](https://developer.wordpress.org/rest-api/reference/posts/)). Drupal: visitors typically see published only; unpublished for creators/editors ([Editorial Workflow](https://www.drupal.org/docs/user_guide/en/planning-workflow.html)). Payload: restrict unauthenticated `read` to `_status: published` ([Drafts](https://payloadcms.com/docs/versions/drafts)). |
| **Admin-only operations** | WordPress: check capabilities before sensitive front- or back-end actions ([Checking User Capabilities](https://developer.wordpress.org/plugins/security/checking-user-capabilities/)). Payload: Access Control hides Admin Panel features and API operations ([Access Control](https://payloadcms.com/docs/access-control/overview)). |
| **Internal notes** | CiviCRM notes with “Author Only” (or elevated “view all notes”) are not public-site content ([Contacts](https://docs.civicrm.org/user/en/latest/organising-your-data/contacts/)). |
| **Reviewer / assignee** | Activity “assigned to” is described as usually within the organisation ([Activities](https://docs.civicrm.org/user/en/latest/organising-your-data/activities/)). CiviVolunteer staff assignment and Manager BCC are admin/staff workflows ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/); [Projects](https://docs.civicrm.org/volunteer/en/latest/projects/)). Sources do not recommend exposing assignee fields on the public marketing site. |
| **Public volunteer surfaces** | Public opportunities (when marked Public), signup/interest forms, and confirmation to the volunteer ([Opportunities](https://docs.civicrm.org/volunteer/en/latest/opportunities/); [Sign-up form](https://docs.civicrm.org/volunteer/en/latest/sign-up-form/); [Interest form](https://docs.civicrm.org/volunteer/en/latest/interest-form/)). |
| **Published editorial content** | WordPress `publish` status; Drupal published nodes; Payload `_status: published` with open `read` — intended public ([cited workflow sections above](#2-content-workflow-draft-in-admin--public-site)). |

Sources do **not** provide a universal checklist for every PII field on a student ERD; treat applicant contact details as staff/CRM data by analogy to CiviCRM contact records and admin-only components, unless a public profile is explicitly configured.

---

## Implications for this ERD

Mapping the student old-age-centre ERD to the sources above.

### `roles` (id, name, description) and `users` (id, role_id, email, pass_hash)

- **Matches:** Separating `roles` from `users`, storing email and a password hash on the user, aligns with WordPress/Drupal/Payload account modeling ([Users](https://developer.wordpress.org/plugins/users/); [`User.php`](https://raw.githubusercontent.com/drupal/drupal/11.x/core/modules/user/src/Entity/User.php); [Authentication Overview](https://payloadcms.com/docs/authentication/overview/)).
- **Diverges:**  
  - Single `role_id` vs Drupal’s **multiple roles** per account ([user_api](https://git.drupalcode.org/project/drupal/-/raw/11.x/core/core.api.php); [User Guide](https://www.drupal.org/docs/user_guide/en/user-concept.html)).  
  - No **capabilities/permissions** table or map — WordPress and Drupal authorize by capability/permission lists on roles, and Drupal docs warn against checking role name alone ([Roles and Capabilities](https://developer.wordpress.org/plugins/users/roles-and-capabilities/); [user_api](https://git.drupalcode.org/project/drupal/-/raw/11.x/core/core.api.php)). Payload authorizes via access functions that may use a role field but are not “role name only” ([Access Control](https://payloadcms.com/docs/access-control/overview)).

### `posts` (id, created_by, title, body, status) and cardinality “many users → one post”

- **Matches:** Creator/author FK and a **status** field match WordPress (`author`, `status`) and Payload (`_status`) patterns ([Posts REST](https://developer.wordpress.org/rest-api/reference/posts/); [Drafts](https://payloadcms.com/docs/versions/drafts)).
- **Diverges:** Diagram cardinality **many users to one post** contradicts the usual editorial model (one author/owner, many content items). WordPress stores one `author` ID per post ([Posts REST](https://developer.wordpress.org/rest-api/reference/posts/)). Correct cardinality is typically **one user creates many posts**.
- Status enum values should follow a chosen source if claimed as “standard”; WordPress documents `publish|future|draft|pending|private`; Payload documents `draft|published`; Drupal uses published boolean (+ optional moderation). Do not assume uncited enums.

### `categories`, `articles` (category_id, author_id, title, body, tags) vs `posts`

- **Partial match:** Category + author + body resemble WordPress posts with taxonomies, or a Drupal content type ([Posts REST](https://developer.wordpress.org/rest-api/reference/posts/); [Adding a Content Type](https://www.drupal.org/docs/user_guide/en/structure-content-type.html)).
- **Diverges:** Maintaining **both** `posts` and `articles` as peer tables is not the WordPress core model (post types / one posts API) and is not Drupal’s “one node entity, many bundles” story. It can resemble **two Payload collections** or **two Drupal content types**, but then both should share the same draft/publish and access rules.  
- `tags` as a single column diverges from WordPress’s term array / taxonomy relation ([Posts REST](https://developer.wordpress.org/rest-api/reference/posts/)).  
- `articles` lack an explicit **status** in the listed columns, while `posts` have one — unlike WordPress/Drupal/Payload, where workflow status sits on the content item itself.

### `opportunities` (no FKs drawn)

- **Matches intent:** A first-class opportunity with title, timing/location-like attributes, and status-like flags is consistent with CiviVolunteer opportunities (role, time, public/enabled, capacity) under a project ([Opportunities](https://docs.civicrm.org/volunteer/en/latest/opportunities/); [Projects](https://docs.civicrm.org/volunteer/en/latest/projects/)).
- **Diverges / gaps:** CiviVolunteer opportunities belong to a **project**; the ERD has no project entity. `application_link` as an opaque URL is not how CiviVolunteer documents signup (in-app forms creating assignments) ([Sign-up form](https://docs.civicrm.org/volunteer/en/latest/sign-up-form/)). Fields like `education_level`, `verified` are **not** defined in the CiviVolunteer opportunity docs cited; do not treat them as sourced from that product.

### `volunteer_applications` (reviewed_by, identity fields, status, submitted_at, internal_notes) and missing link to `opportunities`

- **Matches:**  
  - Public applicant identity without requiring a site login matches CiviVolunteer anonymous signup / interest form collecting profile fields ([Sign-up form](https://docs.civicrm.org/volunteer/en/latest/sign-up-form/); [Interest form](https://docs.civicrm.org/volunteer/en/latest/interest-form/)).  
  - Nullable `reviewed_by` staff user echoes activity **assigned to** / staff review ([Activities](https://docs.civicrm.org/user/en/latest/organising-your-data/activities/)).  
  - `internal_notes` aligns with private CRM notes (Author Only / permission-gated) ([Contacts](https://docs.civicrm.org/user/en/latest/organising-your-data/contacts/)).  
  - One staff user reviewing many applications matches “assigned to” / manager workflows at a high level.
- **Diverges:**  
  - **No FK to `opportunities`:** CiviVolunteer **assignments** explicitly link a contact to a **specific opportunity**; only the separate interest form is opportunity-agnostic ([Assignments](https://docs.civicrm.org/volunteer/en/latest/assignments/); [Interest form](https://docs.civicrm.org/volunteer/en/latest/interest-form/)). An ERD that models opportunity-specific applications without that FK diverges from CiviVolunteer’s assignment model.  
  - Status labels such as Submitted / Under Review / Contacted are **from the ERD**, not copied from CiviCRM’s documented default activity statuses ([Activities](https://docs.civicrm.org/user/en/latest/organising-your-data/activities/)). Custom statuses are allowed in CiviCRM generally, but these exact values are not sourced here.  
  - Storing `full_name` / `email` / `phone` only on the application (no Contact entity) is a simplification vs CiviCRM’s contact-centred model ([Contacts](https://docs.civicrm.org/user/en/latest/organising-your-data/contacts/)).

### Privacy implications for this ERD

- Keep **`users.pass_hash`**, draft **`posts.status`** (non-published), **`volunteer_applications.internal_notes`**, and **`reviewed_by`** on the admin/API side only — consistent with hash, draft, notes, and assignee guidance above.
- Expose published editorial fields and public opportunity listings according to status/public flags — consistent with CMS publish rules and CiviVolunteer **Public** opportunities.
- Do not expose applicant PII or internal notes on the public site; sources place those in CRM/admin contexts.

---

## Source list

1. https://developer.wordpress.org/plugins/users/  
2. https://developer.wordpress.org/plugins/users/roles-and-capabilities/  
3. https://developer.wordpress.org/plugins/security/checking-user-capabilities/  
4. https://wordpress.org/documentation/article/roles-and-capabilities/  
5. https://developer.wordpress.org/rest-api/reference/posts/  
6. https://developer.wordpress.org/reference/functions/register_post_type/  
7. https://www.drupal.org/docs/user_guide/en/user-concept.html  
8. https://www.drupal.org/docs/user_guide/en/planning-workflow.html  
9. https://www.drupal.org/docs/user_guide/en/structure-content-type.html  
10. https://git.drupalcode.org/project/drupal/-/raw/11.x/core/core.api.php (user_api documentation block)  
11. https://git.drupalcode.org/project/drupal/-/raw/11.x/core/lib/Drupal/Core/Entity/EntityPublishedInterface.php  
12. https://git.drupalcode.org/project/drupal/-/raw/11.x/core/modules/node/src/NodeInterface.php  
13. https://raw.githubusercontent.com/drupal/drupal/11.x/core/modules/user/src/Entity/User.php  
14. https://payloadcms.com/docs/authentication/overview/  
15. https://payloadcms.com/docs/access-control/overview  
16. https://payloadcms.com/docs/versions/drafts  
17. https://payloadcms.com/docs/configuration/collections  
18. https://docs.civicrm.org/user/en/latest/organising-your-data/contacts/  
19. https://docs.civicrm.org/user/en/latest/organising-your-data/activities/  
20. https://docs.civicrm.org/user/en/latest/case-management/what-you-need-to-know/  
21. https://docs.civicrm.org/volunteer/en/latest/  
22. https://docs.civicrm.org/volunteer/en/latest/projects/  
23. https://docs.civicrm.org/volunteer/en/latest/opportunities/  
24. https://docs.civicrm.org/volunteer/en/latest/assignments/  
25. https://docs.civicrm.org/volunteer/en/latest/sign-up-form/  
26. https://docs.civicrm.org/volunteer/en/latest/interest-form/  
27. https://docs.civicrm.org/volunteer/en/latest/custom-data/  
