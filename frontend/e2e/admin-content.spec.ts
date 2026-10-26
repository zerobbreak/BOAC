import { expect, test } from "./mock-api";

test.beforeEach(({ api }) => api.signInAs("admin"));

test("the list shows where each post appears and filters by status", async ({ page }) => {
  await page.goto("/desk/content");
  await expect(page.getByRole("heading", { name: "News posts" })).toBeVisible();

  const live = page.getByRole("link", { name: /Food drive this weekend/ });
  await expect(live).toContainText("News + Homepage");

  await page.getByRole("button", { name: /^Drafts/ }).click();
  await expect(page.getByRole("link", { name: /Should fail/ })).toBeVisible();
  await expect(live).toHaveCount(0);

  await page.getByRole("button", { name: /^On homepage/ }).click();
  await expect(live).toBeVisible();
  await expect(page.getByRole("link", { name: /New garden beds/ })).toHaveCount(0);
});

test("drafts can be deleted in bulk after confirming", async ({ page, api }) => {
  await page.goto("/desk/content");
  await page.getByRole("button", { name: "Select all drafts" }).click();
  await expect(page.getByText("2 drafts selected")).toBeVisible();

  await page.getByRole("button", { name: "Delete drafts…" }).click();
  await page.getByRole("button", { name: "Delete for good" }).click();

  await expect(page.getByRole("link", { name: /Should fail/ })).toHaveCount(0);
  expect(api.callsTo("DELETE", "/admin/content/c-draft-1")).toHaveLength(1);
  expect(api.callsTo("DELETE", "/admin/content/c-draft-2")).toHaveLength(1);
  // Published posts can't be picked for bulk delete.
  expect(api.calls.filter((call) => call.method === "DELETE" && call.path === "/admin/content/c-live")).toHaveLength(0);
});

test("a new post can be published to the homepage, with a homepage preview", async ({ page, api }) => {
  await page.goto("/desk/content");
  await page.getByRole("link", { name: "New post" }).click();

  await expect(page.getByRole("group", { name: "Where will this appear?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish to News" })).toBeVisible();

  await page.getByLabel("Title").fill("Open day on Saturday");
  await page.getByLabel("Text").fill("Everyone is welcome.");
  await page.getByRole("radio", { name: /News page \+ Homepage/ }).check();

  // Choosing the homepage switches the preview to it, next to the post already featured there.
  const preview = page.getByRole("complementary", { name: "Preview" });
  await expect(preview.getByRole("heading", { name: "From the centre" })).toBeVisible();
  await expect(preview.getByText("Open day on Saturday")).toBeVisible();
  await expect(preview.getByText("Food drive this weekend")).toBeVisible();

  await page.getByRole("button", { name: "Publish to News + Homepage" }).click();
  await expect(page.getByText(/live on the News page and the homepage/)).toBeVisible();
  expect(api.callsTo("POST", "/admin/content")[0].body).toMatchObject({
    title: "Open day on Saturday",
    status: "published",
    placement: "home",
  });
});

test("a news-only post explains it is not on the homepage", async ({ page }) => {
  await page.goto("/desk/content?edit=c-news");
  const preview = page.getByRole("complementary", { name: "Preview" });
  await preview.getByRole("button", { name: "Homepage" }).click();
  await expect(preview.getByRole("heading", { name: "Not on the homepage" })).toBeVisible();

  await preview.getByRole("button", { name: "Feature on the homepage" }).click();
  await expect(page.getByRole("radio", { name: /News page \+ Homepage/ })).toBeChecked();
});

test("a post whose category was removed saves as No category", async ({ page, api }) => {
  api.state.content.find((item) => item.id === "c-news")!.categoryId = "cat-deleted";
  await page.goto("/desk/content?edit=c-news");

  await expect(page.getByLabel("Category")).toHaveValue("");
  await page.getByLabel("Title").fill("New garden beds are in");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("status")).toHaveText("Saved");
  expect(api.callsTo("PATCH", "/admin/content/c-news")[0].body).toMatchObject({ categoryId: null });
});
