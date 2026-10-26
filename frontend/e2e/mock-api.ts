import { test as base, expect, type Page, type Route } from "@playwright/test";

/*
 * A fake backend for the end-to-end tests. The dev server is started with VITE_API_URL pointing at
 * http://api.test (see playwright.config.ts), and every request to it is answered here from an
 * in-memory copy of the data, so the tests need no database and never touch the real API.
 * Each test gets fresh data; `api.calls` records what the pages sent, and any request this file
 * does not know about fails the test so the mock cannot drift from the pages silently.
 */

export const API = "http://api.test";
const APP_ORIGIN = "http://localhost:5199";

const day = 24 * 60 * 60 * 1000;
const at = (offsetDays: number, hour = 9) => {
  const date = new Date(Date.now() + offsetDays * day);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

type Role = "admin" | "volunteer";
type Json = Record<string, any>;
export type Call = { method: string; path: string; body: Json | null };

const users = {
  admin: { id: "u-admin", name: "Test Admin", email: "admin@boac.test", role: "admin" },
  volunteer: { id: "u-anna", name: "Anna Botha", email: "anna@boac.test", role: "volunteer" },
};

export const PASSWORD = "correct-horse";

function content(id: string, fields: Json) {
  return {
    id, type: "post", body: "", status: "draft", placement: "news", authorId: "u-admin",
    categoryId: null, tagIds: [], coverUrl: null, createdAt: at(-10), updatedAt: at(-5), ...fields,
  };
}

function seed() {
  return {
    signedIn: null as Role | null,
    content: [
      content("c-live", { title: "Food drive this weekend", body: "Volunteers are welcome.", status: "published", placement: "home", categoryId: "cat-events", updatedAt: at(-1) }),
      content("c-news", { title: "New garden beds", body: "The garden is growing.", status: "published", updatedAt: at(-3) }),
      content("c-draft-1", { title: "Should fail", updatedAt: at(-6) }),
      content("c-draft-2", { title: "Community Update: New Food Drive", updatedAt: at(-7) }),
    ],
    categories: [
      { id: "cat-events", name: "Events" },
      { id: "cat-health", name: "Health" },
    ],
    opportunities: [
      { id: "o-kitchen", title: "Kitchen helper", status: "open", public: true, location: "Main hall kitchen", closingDate: null, createdAt: at(-20), updatedAt: at(-20) },
      { id: "o-garden", title: "Garden day", status: "open", public: false, location: "Vegetable garden", closingDate: null, createdAt: at(-19), updatedAt: at(-19) },
      { id: "o-old", title: "Winter blanket drive", status: "closed", public: true, location: null, closingDate: null, createdAt: at(-90), updatedAt: at(-60) },
    ],
    applications: [
      { id: "a-thabo", opportunityId: "o-kitchen", fullName: "Thabo Mokoena", email: "thabo@example.com", phone: "072 555 0141", skills: "Cooking for groups", availability: "Saturdays", motivation: "My grandmother comes to the centre.", status: "submitted", internalNotes: "", files: [], reviewedBy: null, submittedAt: at(-2) },
      { id: "a-lerato", opportunityId: "o-kitchen", fullName: "Lerato Ndlovu", email: "lerato@example.com", phone: null, skills: "Teaching", availability: "Afternoons", motivation: "I'd like to read with the elders.", status: "under_review", internalNotes: "", files: [], reviewedBy: null, submittedAt: at(-4) },
    ],
    messages: [
      { id: "m-naledi", name: "Naledi Khumalo", email: "naledi@example.com", phone: "082 555 0123", subject: "Visiting hours", message: "Can family join lunch on Fridays?", status: "new", createdAt: at(-1) },
      { id: "m-pieter", name: "Pieter van Wyk", email: "pieter@example.com", phone: null, subject: "Donating blankets", message: "We have 40 blankets to give.", status: "handled", createdAt: at(-8) },
    ],
    assignments: [
      { id: "w-1", volunteerId: "u-anna", volunteerName: "Anna Botha", title: "Kitchen helper", status: "planned", opportunityId: "o-kitchen", location: "Main hall kitchen", startsAt: at(2, 8), hours: null },
      { id: "w-2", volunteerId: "u-anna", volunteerName: "Anna Botha", title: "Kitchen helper", status: "done", opportunityId: "o-kitchen", location: "Main hall kitchen", startsAt: at(-5, 8), hours: 4 },
    ],
    volunteers: [{ ...users.volunteer, emailVerified: true, createdAt: at(-30), updatedAt: at(-30), banned: false }],
  };
}

type State = ReturnType<typeof seed>;

function work(state: State) {
  return state.assignments
    .filter((item) => item.volunteerId === users.volunteer.id)
    .map((item) => ({
      id: item.id, title: item.title, status: item.status, notes: "", opportunityId: item.opportunityId,
      opportunityTitle: item.opportunityId ? "Kitchen helper" : null, location: item.location,
      startsAt: item.startsAt, hours: item.hours, createdAt: at(-10), updatedAt: at(-1),
    }));
}

type Handler = (args: { state: State; body: Json | null; params: string[]; query: URLSearchParams }) => [number, unknown];

// Method and path pattern -> answer. Shapes follow the backend's routes in backend/src.
const routes: [string, RegExp, Handler][] = [
  // Better Auth
  ["GET", /^\/api\/auth\/get-session$/, ({ state }) => [200, state.signedIn
    ? { session: { id: "s1", userId: users[state.signedIn].id, token: "t", expiresAt: at(1) }, user: { ...users[state.signedIn], emailVerified: true, image: null, createdAt: at(-30), updatedAt: at(-30) } }
    : null]],
  ["POST", /^\/api\/auth\/sign-in\/email$/, ({ state, body }) => {
    const role = (Object.keys(users) as Role[]).find((key) => users[key].email === body?.email);
    if (!role || body?.password !== PASSWORD) return [401, { code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid email or password" }];
    state.signedIn = role;
    return [200, { redirect: false, token: "t", user: users[role] }];
  }],
  ["POST", /^\/api\/auth\/sign-out$/, ({ state }) => { state.signedIn = null; return [200, { success: true }]; }],
  ["GET", /^\/api\/auth\/admin\/list-users$/, ({ state }) => [200, { users: state.volunteers, total: state.volunteers.length }]],

  // Public
  ["GET", /^\/content$/, ({ state, query }) => [200, {
    content: state.content
      .filter((item) => item.status === "published" && (query.get("placement") !== "home" || item.placement === "home"))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  }]],
  ["GET", /^\/categories$/, ({ state }) => [200, { categories: state.categories }]],
  ["GET", /^\/opportunities$/, ({ state }) => [200, {
    opportunities: state.opportunities.filter((item) => item.public && item.status === "open").map(({ id, title, location, closingDate }) => ({ id, title, location, closingDate })),
  }]],

  // Admin
  ["GET", /^\/admin$/, ({ state }) => [200, { ok: true, user: users[state.signedIn ?? "admin"] }]],
  ["GET", /^\/admin\/content$/, ({ state }) => [200, { content: [...state.content].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) }]],
  ["POST", /^\/admin\/content$/, ({ state, body }) => {
    const item = content(`c-new-${state.content.length}`, { ...body, categoryId: body?.categoryId ?? null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    state.content.push(item);
    return [201, { content: item }];
  }],
  ["PATCH", /^\/admin\/content\/([^/]+)$/, ({ state, body, params }) => {
    const item = state.content.find((entry) => entry.id === params[0]);
    if (!item) return [404, { error: "Not found" }];
    Object.assign(item, body, { updatedAt: new Date().toISOString() });
    return [200, { content: item }];
  }],
  ["DELETE", /^\/admin\/content\/([^/]+)$/, ({ state, params }) => {
    state.content = state.content.filter((entry) => entry.id !== params[0]);
    return [200, { ok: true }];
  }],
  ["GET", /^\/admin\/categories$/, ({ state }) => [200, { categories: state.categories }]],
  ["POST", /^\/admin\/categories$/, ({ state, body }) => {
    const category = { id: `cat-${state.categories.length + 1}`, name: String(body?.name) };
    state.categories.push(category);
    return [201, { category }];
  }],
  ["DELETE", /^\/admin\/categories\/([^/]+)$/, ({ state, params }) => {
    state.categories = state.categories.filter((entry) => entry.id !== params[0]);
    for (const item of state.content) if (item.categoryId === params[0]) item.categoryId = null;
    return [200, { ok: true }];
  }],
  ["GET", /^\/admin\/opportunities$/, ({ state }) => [200, { opportunities: state.opportunities }]],
  ["POST", /^\/admin\/opportunities$/, ({ state, body }) => {
    const opportunity = { id: `o-${state.opportunities.length + 1}`, location: null, closingDate: null, createdAt: at(0), updatedAt: at(0), ...body } as State["opportunities"][number];
    state.opportunities.unshift(opportunity);
    return [201, { opportunity }];
  }],
  ["PATCH", /^\/admin\/opportunities\/([^/]+)$/, ({ state, body, params }) => {
    const item = state.opportunities.find((entry) => entry.id === params[0]);
    if (!item) return [404, { error: "Not found" }];
    Object.assign(item, body);
    return [200, { opportunity: item }];
  }],
  ["GET", /^\/admin\/applications$/, ({ state }) => [200, { applications: state.applications }]],
  ["PATCH", /^\/admin\/applications\/([^/]+)$/, ({ state, body, params }) => {
    const item = state.applications.find((entry) => entry.id === params[0]);
    if (!item) return [404, { error: "Not found" }];
    if ((body?.status === "needs_info" || body?.status === "declined") && !body?.internalNotes) return [400, { error: "A note is required" }];
    Object.assign(item, { status: body?.status, internalNotes: body?.internalNotes ?? item.internalNotes });
    return [200, body?.status === "accepted" ? { application: item, password: "mango-river-42" } : { application: item }];
  }],
  ["GET", /^\/admin\/assignments$/, ({ state }) => [200, { assignments: state.assignments }]],
  ["POST", /^\/admin\/assignments$/, ({ state, body }) => {
    const opportunity = state.opportunities.find((item) => item.id === body?.opportunityId)!;
    const assignment = { id: `w-${state.assignments.length + 1}`, volunteerId: String(body?.volunteerId), volunteerName: "Anna Botha", title: opportunity.title, status: "planned", opportunityId: opportunity.id, location: opportunity.location, startsAt: body?.startsAt ?? null, hours: null };
    state.assignments.push(assignment);
    return [201, { assignment: { ...assignment, opportunityTitle: opportunity.title } }];
  }],
  ["GET", /^\/admin\/messages$/, ({ state }) => [200, { messages: state.messages }]],
  ["PATCH", /^\/admin\/messages\/([^/]+)$/, ({ state, body, params }) => {
    const item = state.messages.find((entry) => entry.id === params[0]);
    if (!item) return [404, { error: "Not found" }];
    item.status = body?.status;
    return [200, { message: item }];
  }],

  // Volunteer
  ["GET", /^\/volunteer\/dashboard$/, ({ state }) => {
    const items = work(state);
    const spaces = new Map<string, typeof items>();
    for (const item of items) spaces.set(item.location ?? "Unassigned", [...(spaces.get(item.location ?? "Unassigned") ?? []), item]);
    return [200, {
      profile: users.volunteer,
      schedule: { upcoming: items.filter((item) => item.status !== "done"), finished: items.filter((item) => item.status === "done") },
      spaces: [...spaces.entries()].map(([name, assignments]) => ({ name, assignments })),
    }];
  }],
  ["GET", /^\/volunteer\/work$/, ({ state }) => [200, { work: work(state) }]],
  ["PATCH", /^\/volunteer\/work\/([^/]+)$/, ({ state, body, params }) => {
    const item = state.assignments.find((entry) => entry.id === params[0]);
    if (!item) return [404, { error: "Not found" }];
    Object.assign(item, body);
    return [200, { work: work(state).find((entry) => entry.id === params[0]) }];
  }],
];

function cors(): Record<string, string> {
  return {
    "access-control-allow-origin": APP_ORIGIN,
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
  };
}

export class MockApi {
  state: State = seed();
  calls: Call[] = [];
  unhandled: string[] = [];

  async install(page: Page) {
    await page.route(`${API}/**`, (route) => this.handle(route));
  }

  // Start the page already signed in, as if the session cookie were set.
  signInAs(role: Role) {
    this.state.signedIn = role;
  }

  // Requests the pages sent that change data, e.g. callsTo("PATCH", "/admin/content/c-draft-1").
  callsTo(method: string, path: string) {
    return this.calls.filter((call) => call.method === method && call.path === path);
  }

  private async handle(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: cors() });

    let body: Json | null = null;
    try {
      body = request.postDataJSON();
    } catch {
      body = null;
    }
    this.calls.push({ method, path: url.pathname, body });

    for (const [verb, pattern, handler] of routes) {
      const match = verb === method ? pattern.exec(url.pathname) : null;
      if (!match) continue;
      const [status, payload] = handler({ state: this.state, body, params: match.slice(1), query: url.searchParams });
      return route.fulfill({ status, headers: { ...cors(), "content-type": "application/json" }, body: JSON.stringify(payload) });
    }
    this.unhandled.push(`${method} ${url.pathname}`);
    return route.fulfill({ status: 404, headers: { ...cors(), "content-type": "application/json" }, body: JSON.stringify({ error: "Not mocked" }) });
  }
}

// auto: every test gets the mock, even one that never reads `api`, so no request reaches a real server.
export const test = base.extend<{ api: MockApi }>({
  api: [
    async ({ page }, use) => {
      const api = new MockApi();
      await api.install(page);
      await use(api);
      expect(api.unhandled, "requests the mock API does not know about").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
