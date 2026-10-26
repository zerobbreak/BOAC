import { expect, test } from "./mock-api";

test("the homepage shows the posts featured from the desk", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Batšofe tiang maatla." })).toBeVisible();
  const section = page.locator("section", { has: page.getByRole("heading", { name: "From the centre" }) });
  await expect(section.getByRole("link", { name: "Food drive this weekend" })).toBeVisible();
  // News-only posts stay off the homepage.
  await expect(section.getByText("New garden beds")).toHaveCount(0);
  await expect(section.getByRole("link", { name: "All news" })).toHaveAttribute("href", "/media");
});

test("the homepage hides the section when nothing is featured", async ({ page, api }) => {
  for (const item of api.state.content) item.placement = "news";
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Batšofe tiang maatla." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Six villages. One centre." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "From the centre" })).toHaveCount(0);
});

test("the News page lists every published post", async ({ page }) => {
  await page.goto("/media");
  await expect(page.getByRole("link", { name: "Food drive this weekend" })).toBeVisible();
  await expect(page.getByRole("link", { name: "New garden beds" })).toBeVisible();
  await expect(page.getByText("Should fail")).toHaveCount(0);
});

test("the about page loads", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "Rooted in respect and heritage." })).toBeVisible();
});

test("the contact form has its fields", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Message")).toBeVisible();
});
