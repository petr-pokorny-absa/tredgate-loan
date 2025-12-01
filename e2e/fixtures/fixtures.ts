import { test as base } from '@playwright/test'
import { AppPage } from '../pages/AppPage'

/**
 * Custom fixtures for E2E tests
 */
type CustomFixtures = {
  appPage: AppPage
}

/**
 * Extended test with custom fixtures
 */
export const test = base.extend<CustomFixtures>({
  appPage: async ({ page }, use) => {
    const appPage = new AppPage(page)
    await appPage.initialize()
    await use(appPage)
  },
})

export { expect } from '@playwright/test'
