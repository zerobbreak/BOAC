import { expect, test } from "./mock-api";

test.beforeEach(({ api }) => api.signInAs("admin"));

test("new messages open with reply and call links", async ({ page }) => {
  await page.goto("/desk/messages");

  await expect(page.getByRole("heading", { name: "Messages", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Visiting hours" })).toBeVisible();
  await expect(page.getByText("Can family join lunch on Fridays?").last()).toBeVisible();
  await expect(page.getByRole("link", { name: "Reply by email" })).toHaveAttribute(
    "href",
    "mailto:naledi@example.com?subject=Re%3A%20Visiting%20hours",
  );
  await expect(page.getByRole("link", { name: "Call 082 555 0123" })).toHaveAttribute("href", "tel:0825550123");
});

test("marking a message handled moves it out of New", async ({ page, api }) => {
  await page.goto("/desk/messages");
  await page.getByRole("button", { name: "Mark handled" }).click();

  await expect(page.getByText("All caught up.")).toBeVisible();
  expect(api.callsTo("PATCH", "/admin/messages/m-naledi")[0].body).toEqual({ status: "handled" });

  await page.getByRole("button", { name: /^Handled/ }).click();
  await expect(page.getByRole("list", { name: "Messages" })).toContainText("Naledi Khumalo");
  await expect(page.getByRole("list", { name: "Messages" })).toContainText("Pieter van Wyk");
});
