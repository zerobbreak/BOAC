import { expect, test } from '@playwright/test'
import { adminAccount, adminState, apiUrl, signIn, signOut } from './support'

test.describe('admin desk', () => {
  test.skip(!adminAccount, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the admin desk tests')

  test.use({ storageState: adminState })

  test.beforeEach(async ({ page }) => {
    await page.goto('/desk')
  })

  test('opens on the desk for the signed-in admin', async ({ page }) => {
    await expect(page.getByText('Admin desk')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Today’s desk')
    await expect(page.getByText(`Signed in as ${adminAccount!.email}.`)).toBeVisible()
  })

  test('every desk section opens from the side navigation', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Desk' })

    for (const [label, path, heading] of [
      ['Content', '/desk/content', 'News & content'],
      ['Library', '/desk/library', 'Library'],
      ['Opportunities', '/desk/opportunities', 'Opportunities'],
      ['Applications', '/desk/applications', 'Applications'],
      ['Assign', '/desk/assign', 'Assign a space'],
      ['Messages', '/desk/messages', 'Messages'],
      ['Desk', '/desk', 'Today’s desk'],
    ] as const) {
      await nav.getByRole('link', { name: label, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    }
  })

  test('the Opportunities page lists every opportunity the admin API returns', async ({ page }) => {
    // page.request shares the browser's session cookie, so this is the same data the page gets.
    const response = await page.request.get(`${apiUrl}/admin/opportunities`)
    expect(response.ok()).toBe(true)
    const { opportunities } = (await response.json()) as { opportunities: { title: string }[] }

    await page.goto('/desk/opportunities')

    const cards = page.locator('.list article.card h2')
    await expect(cards).toHaveText(opportunities.map((item) => item.title))
  })
})

// Signing out revokes the session on the server, so this uses its own sign-in rather than the shared one.
test('signing out of the admin desk ends the session', async ({ page }) => {
  test.skip(!adminAccount, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the admin desk tests')
  await signIn(page, adminAccount!)

  await signOut(page)

  await page.goto('/desk')
  await expect(page).toHaveURL(/\/login$/)
})
