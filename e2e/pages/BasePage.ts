import { Page, Locator } from '@playwright/test'

/**
 * Base Page Object
 * Contains common functionality for all page objects
 */
export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Navigate to the application
   */
  async goto() {
    await this.page.goto('/')
  }

  /**
   * Clear localStorage to reset application state
   * Must be called after navigation to the page
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => {
      try {
        localStorage.clear()
      } catch {
        // Ignore if localStorage is not available
      }
    })
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get text content of an element
   */
  async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent()) || ''
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible()
  }

  /**
   * Fill input field
   */
  async fillInput(locator: Locator, value: string) {
    await locator.fill(value)
  }

  /**
   * Click on element
   */
  async click(locator: Locator) {
    await locator.click()
  }
}
