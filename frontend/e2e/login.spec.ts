import { PASSWORD, expect, test } from "./mock-api";

test("an admin signs in and lands on the desk", async ({ page, api }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@boac.test");
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/desk");
  await expect(page.getByRole("heading", { name: "Today’s desk" })).toBeVisible();
  expect(api.callsTo("POST", "/api/auth/sign-in/email")[0].body).toMatchObject({ email: "admin@boac.test" });
});

test("a wrong password shows an error and stays on the sign-in page", async ({ page, api }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@boac.test");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("alert")).toHaveText("Invalid email or password");
  await expect(page).toHaveURL("/login");
  expect(api.state.signedIn).toBeNull();
});

test("the desk sends signed-out visitors to the sign-in page", async ({ page, api }) => {
  await page.goto("/desk/content");
  await expect(page).toHaveURL("/login");
  expect(api.state.signedIn).toBeNull();
});
