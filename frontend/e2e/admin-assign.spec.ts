import { expect, test } from "./mock-api";

test.beforeEach(({ api }) => api.signInAs("admin"));

test("existing shifts are listed, coming up and done", async ({ page }) => {
  await page.goto("/desk/assign");

  await expect(page.getByRole("heading", { name: "Assign work" })).toBeVisible();
  const table = page.getByRole("table");
  await expect(table.getByRole("row", { name: /Anna Botha.*Planned/ })).toBeVisible();

  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("columnheader", { name: "Hours" })).toBeVisible();
  await expect(table.getByRole("row", { name: /Anna Botha.*Done.*4/ })).toBeVisible();
});

test("a volunteer can be assigned, with a warning when they are already booked then", async ({ page, api }) => {
  const booked = new Date(api.state.assignments[0].startsAt!);
  const local = new Date(booked.getTime() - booked.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  await page.goto("/desk/assign");
  await page.getByLabel("Volunteer").selectOption({ label: "Anna Botha · anna@boac.test" });
  await page.getByLabel("Opportunity").selectOption({ label: "Kitchen helper · Main hall kitchen" });
  await page.getByLabel("Starts").fill(local);
  await expect(page.getByRole("alert")).toContainText("Anna Botha already has Kitchen helper");

  await page.getByRole("button", { name: "Assign", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Assigned Kitchen helper");
  expect(api.callsTo("POST", "/admin/assignments")[0].body).toMatchObject({ volunteerId: "u-anna", opportunityId: "o-kitchen" });
});
