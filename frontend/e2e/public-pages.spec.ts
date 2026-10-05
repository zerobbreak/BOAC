import { expect, test } from '@playwright/test'

const pages = [
  ['/', 'Batšofe tiang maatla.'],
  ['/about', 'Rooted in respect and heritage.'],
  ['/programmes', 'Growth, knowledge and company, across generations.'],
  ['/youth', 'The next generation, raised by the last.'],
  ['/media', 'From the centre.'],
  ['/get-involved', 'There’s a place for you here.'],
  ['/volunteer', 'Give your time to the elders of Bokwidi.'],
  ['/donate', 'Give to the elders of Bokwidi.'],
  ['/contact', 'Come by, call, or write.'],
] as const

for (const [path, heading] of pages) {
  test(`${path} shows its page heading without script errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))

    const response = await page.goto(path)

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    expect(errors).toEqual([])
  })
}

test('main navigation reaches every section', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main' })

  for (const [label, path, heading] of [
    ['About', '/about', 'Rooted in respect and heritage.'],
    ['Programmes', '/programmes', 'Growth, knowledge and company, across generations.'],
    ['Youth', '/youth', 'The next generation, raised by the last.'],
    ['News', '/media', 'From the centre.'],
    ['Get involved', '/get-involved', 'There’s a place for you here.'],
    ['Contact', '/contact', 'Come by, call, or write.'],
    ['Home', '/', 'Batšofe tiang maatla.'],
  ] as const) {
    await nav.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/' : path}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
  }
})

test('an unknown address falls back to the home page', async ({ page }) => {
  await page.goto('/no-such-page')

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Batšofe tiang maatla.')
})
