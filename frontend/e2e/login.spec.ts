import { expect, test } from '@playwright/test'
import { adminAccount } from './support'

test('the desk sends a signed-out visitor to the sign-in page', async ({ page }) => {
  await page.goto('/desk')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in to the desk')
})

test('a wrong password is refused and no session is created', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(adminAccount?.email ?? 'nobody@boac.test')
  await page.getByLabel('Password').fill('not-the-real-password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
  const cookies = await page.context().cookies()
  expect(cookies.filter((cookie) => cookie.name.includes('session_token'))).toEqual([])
})
