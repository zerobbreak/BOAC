import { expect, test } from "./mock-api";

test.beforeEach(({ api }) => api.signInAs("volunteer"));

test("the schedule leads with the next shift and the totals", async ({ page }) => {
  await page.goto("/desk");

  await expect(page.getByRole("heading", { name: "Hi Anna" })).toBeVisible();
  await expect(page.getByText("Your next shift")).toBeVisible();
  await expect(page.getByText("Kitchen helper · Main hall kitchen")).toBeVisible();
  await expect(page.locator(".tiles")).toContainText("1shift coming up");
  await expect(page.locator(".tiles")).toContainText("4hours given");

  const nav = page.getByRole("navigation", { name: "Desk" });
  for (const name of ["Schedule", "My work", "Places"]) await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
});

test("my work saves the status from the switch", async ({ page, api }) => {
  await page.goto("/desk/work");
  await expect(page.getByRole("heading", { name: "My work" })).toBeVisible();

  const planned = page.locator("article").first();
  await planned.getByText("Doing it").click();
  await expect.poll(() => api.callsTo("PATCH", "/volunteer/work/w-1").length).toBe(1);
  expect(api.callsTo("PATCH", "/volunteer/work/w-1")[0].body).toEqual({ status: "in_progress" });
  await expect(page.getByRole("heading", { name: "Did something extra?" })).toBeVisible();
});

test("places group shifts by where they happen", async ({ page }) => {
  await page.goto("/desk/spaces");
  await expect(page.getByRole("heading", { name: "Places" })).toBeVisible();
  const kitchen = page.locator("article", { hasText: "Main hall kitchen" });
  await expect(kitchen).toContainText("2 shifts");
  await expect(kitchen).toContainText("1 earlier shift done");
});
