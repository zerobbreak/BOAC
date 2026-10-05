import { expect, test } from '@playwright/test'
import { apiUrl } from './support'

// These compare what the site shows with what the API returns right now, so they hold whatever data is live.

test('the API reports a working database and bucket', async ({ request }) => {
  const response = await request.get(`${apiUrl}/health`)

  expect(response.ok()).toBe(true)
  expect(await response.json()).toEqual({ database: true, bucket: true })
})

test('the News page lists the published content from the API', async ({ page, request }) => {
  const { content } = (await (await request.get(`${apiUrl}/content`)).json()) as { content: { title: string }[] }

  await page.goto('/media')

  if (!content.length) {
    await expect(page.getByText('Nothing has been posted yet. Check back soon.')).toBeVisible()
    return
  }
  // The page shows the first page of items; each of those titles must be on screen.
  for (const { title } of content.slice(0, 6)) {
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible()
  }
})

test('the volunteer form offers exactly the open opportunities from the API', async ({ page, request }) => {
  const { opportunities } = (await (await request.get(`${apiUrl}/opportunities`)).json()) as {
    opportunities: { title: string; location?: string | null }[]
  }

  await page.goto('/volunteer')
  const area = page.getByLabel('Area of interest')

  if (!opportunities.length) {
    await expect(area).toBeDisabled()
    await expect(area.locator('option')).toHaveText(['No roles are open right now'])
    return
  }
  await expect(area).toBeEnabled()
  await expect(area.locator('option')).toHaveText([
    'Choose where you’d like to help',
    ...opportunities.map((item) => `${item.title}${item.location ? ` · ${item.location}` : ''}`),
  ])
})

test('the contact form will not send with required fields empty', async ({ page }) => {
  const posts: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url())
  })

  await page.goto('/contact')
  await expect(page.getByLabel('Full name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Message')).toBeVisible()

  await page.getByRole('button', { name: 'Send message' }).click()

  // The browser's required-field check stops the submit, so nothing reaches the API.
  const missing = await page.getByLabel('Full name').evaluate((input) => (input as HTMLInputElement).validity.valueMissing)
  expect(missing).toBe(true)
  expect(posts).toEqual([])
})
