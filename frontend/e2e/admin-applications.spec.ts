import { expect, test } from "./mock-api";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });
test.beforeEach(({ api }) => api.signInAs("admin"));

test("applicants are listed and opened one at a time", async ({ page }) => {
  await page.goto("/desk/applications");

  const list = page.getByRole("list", { name: "Applicants" });
  await expect(list.getByRole("button", { name: /Thabo Mokoena/ })).toContainText("New");
  await expect(page.getByRole("heading", { name: "Thabo Mokoena" })).toBeVisible();

  await list.getByRole("button", { name: /Lerato Ndlovu/ }).click();
  await expect(page.getByRole("heading", { name: "Lerato Ndlovu" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Progress" })).toContainText("✓ New");
});

test("next steps are named, and declining needs a note", async ({ page, api }) => {
  await page.goto("/desk/applications");
  await page.getByRole("list", { name: "Applicants" }).getByRole("button", { name: /Lerato Ndlovu/ }).click();

  const decline = page.getByRole("button", { name: "Decline" });
  await expect(decline).toBeDisabled();
  await page.getByLabel("Private note (only staff see this)").fill("Not available on the days we need.");
  await decline.click();

  await expect.poll(() => api.callsTo("PATCH", "/admin/applications/a-lerato").length).toBe(1);
  expect(api.callsTo("PATCH", "/admin/applications/a-lerato")[0].body).toEqual({
    status: "declined",
    internalNotes: "Not available on the days we need.",
  });
});

test("accepting shows the new volunteer's password once, with a copy button", async ({ page }) => {
  await page.goto("/desk/applications");
  await page.getByRole("list", { name: "Applicants" }).getByRole("button", { name: /Lerato Ndlovu/ }).click();
  await page.getByRole("button", { name: "Accept & create account" }).click();

  const secret = page.getByRole("status");
  await expect(secret).toContainText("Give them this password now.");
  await expect(secret.locator("code")).toHaveText("mango-river-42");
  await secret.getByRole("button", { name: "Copy" }).click();
  await expect(secret.getByRole("button", { name: "Copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("mango-river-42");
});
