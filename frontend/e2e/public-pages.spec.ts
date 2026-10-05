import { test, expect } from "@playwright/test";

test("public home loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Welcome")).toBeVisible();
});

test("public about loads", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByText("About")).toBeVisible();
});

test("public contact loads", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByLabel("Name")).toBeVisible();
});
