import { expect, test } from "./mock-api";

test.beforeEach(({ api }) => api.signInAs("admin"));

test("categories open from News posts and show how they are used", async ({ page }) => {
  await page.goto("/desk/content");
  await page.getByRole("button", { name: "Categories" }).click();

  const panel = page.getByRole("region", { name: "Categories" });
  await expect(panel.getByText("1 post · tab is showing on News")).toBeVisible();
  await expect(panel.getByText("0 posts · no tab until a post is published")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tags" })).toHaveCount(0);

  await panel.getByRole("button", { name: "Done" }).click();
  await expect(panel).toHaveCount(0);
});

test("the old Categories page opens the panel on News posts", async ({ page }) => {
  await page.goto("/desk/library");
  await expect(page).toHaveURL("/desk/content?panel=categories");
  await expect(page.getByRole("region", { name: "Categories" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Desk" }).getByRole("link", { name: "Categories" })).toHaveCount(0);
});

test("a new category can be added", async ({ page, api }) => {
  await page.goto("/desk/content?panel=categories");
  await page.getByLabel("New category", { exact: true }).fill("Fundraising");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(page.getByRole("region", { name: "Categories" }).getByText("Fundraising")).toBeVisible();
  expect(api.callsTo("POST", "/admin/categories")[0].body).toEqual({ name: "Fundraising" });
});

test("a category can be renamed", async ({ page, api }) => {
  await page.goto("/desk/content?panel=categories");
  const panel = page.getByRole("region", { name: "Categories" });

  await panel.getByRole("listitem").filter({ hasText: "Health" }).getByRole("button", { name: "Rename" }).click();
  await panel.getByLabel("New name for Health").fill("Health and care");
  await panel.getByRole("button", { name: "Save" }).click();

  await expect(panel.getByText("Health and care")).toBeVisible();
  expect(api.callsTo("PATCH", "/admin/categories/cat-health")[0].body).toEqual({ name: "Health and care" });
});

test("removing a category asks first and says what happens to its posts", async ({ page, api }) => {
  await page.goto("/desk/content?panel=categories");
  const events = page.getByRole("region", { name: "Categories" }).getByRole("listitem").filter({ hasText: "Events" });

  await events.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("alert")).toContainText("Its post stays as it is, filed under No category.");

  await page.getByRole("button", { name: "Keep it" }).click();
  expect(api.callsTo("DELETE", "/admin/categories/cat-events")).toHaveLength(0);

  await events.getByRole("button", { name: "Remove" }).click();
  await page.getByRole("button", { name: "Remove category" }).click();
  await expect(events).toHaveCount(0);
  expect(api.callsTo("DELETE", "/admin/categories/cat-events")).toHaveLength(1);
});

test("a category can be made from the post editor and is picked straight away", async ({ page, api }) => {
  await page.goto("/desk/content?edit=c-draft-1");
  const category = page.getByRole("combobox", { name: "Category" });
  await category.selectOption({ label: "+ New category…" });
  await page.getByLabel("New category name").fill("Fundraising");
  // Enter adds the category; it must not submit the post.
  await page.getByLabel("New category name").press("Enter");

  await expect(category).toHaveValue("cat-3");
  await expect(category.locator("option:checked")).toHaveText("Fundraising");
  await expect(page.getByLabel("New category name")).toHaveCount(0);
  expect(api.callsTo("POST", "/admin/categories")[0].body).toEqual({ name: "Fundraising" });
  expect(api.callsTo("PATCH", "/admin/content/c-draft-1")).toHaveLength(0);

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect.poll(() => api.callsTo("PATCH", "/admin/content/c-draft-1")[0]?.body).toMatchObject({ categoryId: "cat-3" });
});
