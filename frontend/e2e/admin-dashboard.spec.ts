import { expect, test } from "./mock-api";

test.beforeEach(({ api }) => api.signInAs("admin"));

test("the desk shows what needs attention, linked to each page", async ({ page }) => {
  await page.goto("/desk");

  await expect(page.getByRole("heading", { name: "Today’s desk" })).toBeVisible();
  const drafts = page.getByRole("link", { name: /Drafts not published/ });
  await expect(drafts).toContainText("2");
  await expect(page.getByRole("link", { name: /Applications to review/ })).toContainText("2");
  await expect(page.getByRole("link", { name: /New messages/ })).toContainText("1");
  await expect(page.getByRole("link", { name: /Open opportunities/ })).toContainText("2");

  await drafts.click();
  await expect(page).toHaveURL("/desk/content");
});

test("the desk lists the posts featured on the homepage", async ({ page }) => {
  await page.goto("/desk");
  await expect(page.getByRole("link", { name: "Food drive this weekend" })).toBeVisible();
  await expect(page.getByText("2 published posts")).toBeVisible();
});

test("the sidebar uses the new page names", async ({ page }) => {
  await page.goto("/desk");
  const nav = page.getByRole("navigation", { name: "Desk" });
  for (const name of ["Desk", "News posts", "Categories", "Opportunities", "Applications", "Assign work", "Messages"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(nav.getByRole("link", { name: "Library" })).toHaveCount(0);
});
