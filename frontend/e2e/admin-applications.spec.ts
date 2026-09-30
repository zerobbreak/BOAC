import { test, expect } from "@playwright/test";

test("admin can view applications", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click("button:has-text('Login')");

  await page.goto("/admin/applications");

  await expect(page.getByText("Applications")).toBeVisible();
});
