import { expect, test } from '@playwright/test'
import { apiUrl, volunteerAccount, volunteerState } from './support'

test.describe('volunteer desk', () => {
  test.skip(!volunteerAccount, 'Set E2E_VOLUNTEER_EMAIL and E2E_VOLUNTEER_PASSWORD to run the volunteer desk tests')

  test.use({ storageState: volunteerState })

  test.beforeEach(async ({ page }) => {
    await page.goto('/desk')
  })

  test('the schedule shows the volunteer’s own name and shifts from the API', async ({ page }) => {
    const response = await page.request.get(`${apiUrl}/volunteer/dashboard`)
    expect(response.ok()).toBe(true)
    const desk = (await response.json()) as {
      profile: { name: string; email: string }
      schedule: { upcoming: { title: string }[]; finished: { title: string }[] }
    }

    await expect(page.getByText('Volunteer desk')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(desk.profile.name)
    await expect(page.getByText(desk.profile.email)).toBeVisible()

    if (desk.schedule.upcoming.length) {
      for (const { title } of desk.schedule.upcoming) await expect(page.getByRole('heading', { level: 2, name: title }).first()).toBeVisible()
    } else {
      await expect(page.getByText('Nothing scheduled.')).toBeVisible()
    }
  })

  test('only the volunteer sections are offered', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Desk' })

    await expect(nav.getByRole('link')).toHaveText(['Schedule', 'Work', 'Spaces'])

    await nav.getByRole('link', { name: 'Work', exact: true }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your work')
    await nav.getByRole('link', { name: 'Spaces', exact: true }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Spaces')
  })

  test('the admin API refuses a volunteer session', async ({ page }) => {
    const response = await page.request.get(`${apiUrl}/admin/opportunities`)

    expect(response.status()).toBe(403)
  })
})
