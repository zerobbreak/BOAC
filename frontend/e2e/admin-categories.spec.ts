import { expect, test } from "./mock-api";

test.beforeEach(({ api }) => api.signInAs("admin"));

test("categories show how they are used and tags are gone", async ({ page }) => {
  await page.goto("/desk/library");

  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();
  await expect(page.getByText("1 post · tab is showing on News")).toBeVisible();
  await expect(page.getByText("0 posts · no tab until a post is published")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tags" })).toHaveCount(0);
});

test("a new category can be added", async ({ page, api }) => {
  await page.goto("/desk/library");
  await page.getByLabel("New category").fill("Fundraising");
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByText("Fundraising")).toBeVisible();
  expect(api.callsTo("POST", "/admin/categories")[0].body).toEqual({ name: "Fundraising" });
});

test("removing a category asks first and says what happens to its posts", async ({ page, api }) => {
  await page.goto("/desk/library");
  const events = page.locator(".card", { hasText: "Events" });

  await events.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("alert")).toContainText("Its post stays as it is, filed under No category.");

  await page.getByRole("button", { name: "Keep it" }).click();
  expect(api.callsTo("DELETE", "/admin/categories/cat-events")).toHaveLength(0);

  await events.getByRole("button", { name: "Remove" }).click();
  await page.getByRole("button", { name: "Remove category" }).click();
  await expect(events).toHaveCount(0);
  expect(api.callsTo("DELETE", "/admin/categories/cat-events")).toHaveLength(1);
});
