import { test as setup } from '@playwright/test'
import { adminAccount, adminState, signIn, volunteerAccount, volunteerState } from './support'

// Sign each role in once and save the session cookie for the desk specs to reuse.
setup('sign in as admin', async ({ page }) => {
  setup.skip(!adminAccount, 'No admin account configured')
  await signIn(page, adminAccount!)
  await page.context().storageState({ path: adminState })
})

setup('sign in as volunteer', async ({ page }) => {
  setup.skip(!volunteerAccount, 'No volunteer account configured')
  await signIn(page, volunteerAccount!)
  await page.context().storageState({ path: volunteerState })
})
