import { expect, test } from "./mock-api";

test.beforeEach(({ api }) => api.signInAs("admin"));

test("opportunities show whether they are on the volunteer form", async ({ page }) => {
  await page.goto("/desk/opportunities");

  await expect(page.getByRole("heading", { name: "Opportunities", level: 1 })).toBeVisible();
  const kitchen = page.locator("article", { hasText: "Kitchen helper" });
  await expect(kitchen.getByText("On volunteer form")).toBeVisible();
  await expect(kitchen).toContainText("2 applications");
  await expect(page.locator("article", { hasText: "Garden day" }).getByText("Staff only")).toBeVisible();

  await page.getByRole("button", { name: /^Closed/ }).click();
  await expect(page.getByText("Winter blanket drive")).toBeVisible();
});

test("an opportunity can be edited: closing date and visibility", async ({ page, api }) => {
  await page.goto("/desk/opportunities");
  await page.locator("article", { hasText: "Kitchen helper" }).getByRole("button", { name: "Edit" }).click();

  await expect(page.getByRole("heading", { name: "Edit opportunity" })).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue("Kitchen helper");
  await page.getByLabel("Closing date (optional)").fill("2030-10-31");
  await page.getByRole("radio", { name: /Staff only/ }).check();
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: "New opportunity" })).toBeVisible();
  expect(api.callsTo("PATCH", "/admin/opportunities/o-kitchen")[0].body).toEqual({
    title: "Kitchen helper",
    location: "Main hall kitchen",
    public: false,
    closingDate: "2030-10-31",
  });
});

test("a new opportunity can be created", async ({ page, api }) => {
  await page.goto("/desk/opportunities");
  await page.getByLabel("Title").fill("Reading buddies");
  await page.getByLabel("Where").fill("Library corner");
  await page.getByRole("button", { name: "Create opportunity" }).click();

  await expect(page.locator("article", { hasText: "Reading buddies" })).toBeVisible();
  expect(api.callsTo("POST", "/admin/opportunities")[0].body).toEqual({
    title: "Reading buddies",
    location: "Library corner",
    public: true,
    status: "open",
  });
});
