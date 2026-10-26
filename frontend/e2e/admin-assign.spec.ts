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

test("a shift that started but was never marked done is overdue, not coming up", async ({ page, api }) => {
  api.state.assignments.push({
    id: "w-late", volunteerId: "u-anna", volunteerName: "Anna Botha", title: "Garden day", status: "planned",
    opportunityId: "o-garden", location: "Vegetable garden", startsAt: new Date(Date.now() - 3 * 86400000).toISOString(), hours: null,
  });
  await page.goto("/desk/assign");

  const table = page.getByRole("table");
  await expect(table.getByRole("row", { name: /Kitchen helper.*Planned/ })).toBeVisible();
  await expect(table.getByRole("row", { name: /Garden day/ })).toHaveCount(0);

  await page.getByRole("button", { name: /Overdue/ }).click();
  await expect(table.getByRole("row", { name: /Garden day.*Vegetable garden.*Planned/ })).toBeVisible();
  await expect(table.getByRole("row", { name: /Kitchen helper/ })).toHaveCount(0);
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
  // The form clears, so a second click can't book it twice.
  await expect(page.getByLabel("Volunteer")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Assign", exact: true })).toBeEnabled();
  expect(api.callsTo("POST", "/admin/assignments")[0].body).toMatchObject({ volunteerId: "u-anna", opportunityId: "o-kitchen" });
});

test("booking someone a second time on the same day warns, even at a different hour", async ({ page, api }) => {
  const booked = new Date(api.state.assignments[0].startsAt!);
  booked.setHours(booked.getHours() + 3);
  const local = new Date(booked.getTime() - booked.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  await page.goto("/desk/assign");
  await page.getByLabel("Volunteer").selectOption({ label: "Anna Botha · anna@boac.test" });
  await page.getByLabel("Starts").fill(local);
  await expect(page.getByRole("alert")).toContainText("Anna Botha already has Kitchen helper");
});

test("every volunteer is offered, past the first page of users", async ({ page, api }) => {
  for (let index = 0; index < 120; index += 1) {
    api.state.volunteers.push({ ...api.state.volunteers[0], id: `u-extra-${index}`, name: `Extra ${index}`, email: `extra${index}@boac.test` });
  }
  await page.goto("/desk/assign");
  // 121 volunteers plus the "Choose" placeholder.
  await expect(page.getByLabel("Volunteer").locator("option")).toHaveCount(122);
  await expect(page.getByLabel("Volunteer").locator("option", { hasText: "Test Admin" })).toHaveCount(0);
});

test("an opportunity whose applications have closed can still be assigned, and says so", async ({ page, api }) => {
  api.state.opportunities.push({
    id: "o-expired", title: "Spring clean", status: "open", public: true, location: null,
    closingDate: new Date(Date.now() - 10 * 86400000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });
  await page.goto("/desk/assign");
  await expect(page.getByLabel("Opportunity").locator("option", { hasText: "Spring clean (applications closed)" })).toHaveCount(1);
});
