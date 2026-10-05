import { expect, type Page } from '@playwright/test'

// Where the API answers. Locally the Vite app talks to the backend on :3000; on Railway it goes through the web service's /_api proxy.
export const apiUrl = (process.env.E2E_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export type Account = { email: string; password: string }

// Real accounts come from the environment so no credentials live in the repo. Desk tests skip when these are unset.
function account(prefix: string): Account | null {
  const email = process.env[`E2E_${prefix}_EMAIL`]
  const password = process.env[`E2E_${prefix}_PASSWORD`]
  return email && password ? { email, password } : null
}

export const adminAccount = account('ADMIN')
export const volunteerAccount = account('VOLUNTEER')

// Signed-in sessions saved once by auth.setup.ts and reused, so the suite stays under Better Auth's sign-in rate limit.
export const adminState = 'playwright/.auth/admin.json'
export const volunteerState = 'playwright/.auth/volunteer.json'

// Better Auth allows a few sign-ins per IP every 10 seconds; when it answers "Too many requests", wait out the window and try again.
export async function signIn(page: Page, { email, password }: Account) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)

  for (let attempt = 0; attempt < 3; attempt++) {
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/sign-in/email')),
      page.getByRole('button', { name: 'Sign in' }).click(),
    ])
    if (response.status() !== 429) break
    await page.waitForTimeout(11_000)
  }
  await expect(page).toHaveURL(/\/desk$/)
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)
}
