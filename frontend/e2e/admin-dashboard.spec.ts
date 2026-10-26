import { API, expect, test } from "./mock-api";

test.beforeEach(({ api }) => api.signInAs("admin"));

test("the desk shows what needs attention, linked to each page", async ({ page }) => {
  await page.goto("/desk");

  await expect(page.getByRole("heading", { name: "Today’s desk" })).toBeVisible();
  const drafts = page.getByRole("link", { name: /Drafts not published/ });
  await expect(drafts).toContainText("2");
  await expect(page.getByRole("link", { name: /Applications to review/ })).toContainText("2");
  await expect(page.getByRole("link", { name: /New messages/ })).toContainText("1");
  // Kitchen helper is on the volunteer form; Garden day is open but staff only, so it doesn't count.
  await expect(page.getByRole("link", { name: /Taking applications/ })).toContainText("1");

  await drafts.click();
  await expect(page).toHaveURL("/desk/content");
});

test("a count that fails to load shows a dash, not a zero", async ({ page }) => {
  await page.route(`${API}/admin/messages`, (route) => route.fulfill({
    status: 500,
    headers: { "access-control-allow-origin": "http://localhost:5199", "access-control-allow-credentials": "true", "content-type": "application/json" },
    body: JSON.stringify({ error: "Internal server error" }),
  }));
  await page.goto("/desk");

  await expect(page.getByRole("link", { name: /New messages/ })).toContainText("—");
  await expect(page.getByText("Internal server error")).toBeVisible();
});

test("drafts are previewed as News cards, newest first, and open in the editor", async ({ page }) => {
  await page.goto("/desk");

  const drafts = page.locator(".desk-drafts").getByRole("heading");
  await expect(drafts).toHaveText(["Should fail", "Community Update: New Food Drive"]);
  await page.getByRole("link", { name: "Should fail" }).click();
  await expect(page).toHaveURL("/desk/content?edit=c-draft-1");
});

test("the desk says when there are no drafts", async ({ page, api }) => {
  api.state.content = api.state.content.filter((item) => item.status === "published");
  await page.goto("/desk");
  await expect(page.getByText(/No drafts\./)).toBeVisible();
});

test("the desk lists the next shifts and flags overdue ones", async ({ page, api }) => {
  api.state.assignments.push({
    id: "w-late", volunteerId: "u-anna", volunteerName: "Anna Botha", title: "Garden day", status: "planned",
    opportunityId: "o-garden", location: "Vegetable garden", startsAt: new Date(Date.now() - 3 * 86400000).toISOString(), hours: null,
  });
  await page.goto("/desk");

  await expect(page.getByRole("table").getByRole("row", { name: /Anna Botha.*Kitchen helper.*Main hall kitchen/ })).toBeVisible();
  await expect(page.getByRole("table").getByRole("row", { name: /Garden day/ })).toHaveCount(0);
  await expect(page.getByText("1 shift has started but is not marked done.")).toBeVisible();
  await page.getByRole("link", { name: "See overdue shifts" }).click();
  await expect(page).toHaveURL("/desk/assign");
});

test("an open opportunity past its closing date is flagged", async ({ page, api }) => {
  api.state.opportunities.push({
    id: "o-expired", title: "Spring clean", status: "open", public: true, location: null,
    closingDate: new Date(Date.now() - 10 * 86400000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });
  await page.goto("/desk");

  await expect(page.getByText("Spring clean is past its closing date but still open")).toBeVisible();
  await expect(page.getByRole("link", { name: /Taking applications/ })).toContainText("1");
  await page.getByRole("link", { name: "Close or extend it" }).click();
  await expect(page).toHaveURL("/desk/opportunities");
});

test("the desk lists the posts featured on the homepage", async ({ page }) => {
  await page.goto("/desk");
  await expect(page.getByRole("link", { name: "Food drive this weekend" })).toBeVisible();
  await expect(page.getByText("2 published posts")).toBeVisible();
});

test("the sidebar uses the new page names", async ({ page }) => {
  await page.goto("/desk");
  const nav = page.getByRole("navigation", { name: "Desk" });
  for (const name of ["Desk", "News posts", "Opportunities", "Applications", "Assign work", "Messages"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  }
  // Categories live on News posts now, so neither old page has a link.
  await expect(nav.getByRole("link", { name: "Library" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Categories" })).toHaveCount(0);
});
