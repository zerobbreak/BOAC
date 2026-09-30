import { test, expect } from "@playwright/test";

test("user can log in", async ({ page }) => {
  await page.goto("/login");

  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "password123");

  await page.click("button:has-text('Login')");

  await expect(page).toHaveURL("/admin");
});
