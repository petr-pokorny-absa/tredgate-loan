import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { texts } from '../helpers/texts'

/**
 * Page Object for Confirm Modal Component
 */
export class ConfirmModalPage extends BasePage {
  // Locators - atomic elements
  readonly modal: Locator
  readonly modalTitle: Locator
  readonly modalMessage: Locator
  readonly confirmButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    super(page)
    
    this.modal = page.locator('.modal-overlay')
    this.modalTitle = this.modal.locator('#modal-title')
    this.modalMessage = this.modal.locator('.modal-body p')
    this.confirmButton = this.modal.locator('button.danger')
    this.cancelButton = this.modal.locator('button.secondary')
  }

  // Atomic actions

  /**
   * Click confirm button
   */
  async clickConfirm() {
    await this.click(this.confirmButton)
  }

  /**
   * Click cancel button
   */
  async clickCancel() {
    await this.click(this.cancelButton)
  }

  /**
   * Get modal title text
   */
  async getModalTitle(): Promise<string> {
    return await this.getTextContent(this.modalTitle)
  }

  /**
   * Get modal message text
   */
  async getModalMessage(): Promise<string> {
    return await this.getTextContent(this.modalMessage)
  }

  // Grouped actions with test.step

  /**
   * Verify modal is visible
   */
  async verifyModalIsVisible() {
    await expect(this.modal, 'Modal should be visible').toBeVisible()
  }

  /**
   * Verify modal is not visible
   */
  async verifyModalIsNotVisible() {
    await expect(this.modal, 'Modal should not be visible').not.toBeVisible()
  }

  /**
   * Verify delete confirmation modal
   */
  async verifyDeleteConfirmation(applicantName: string) {
    await this.verifyModalIsVisible()
    await expect(this.modalTitle, 'Modal title should be correct').toHaveText(texts.modal.deleteTitle)
    const message = await this.getModalMessage()
    expect(message, `Modal message should mention ${applicantName}`).toContain(applicantName)
  }

  /**
   * Confirm and close modal
   */
  async confirmAndClose() {
    await this.clickConfirm()
    await this.verifyModalIsNotVisible()
  }

  /**
   * Cancel and close modal
   */
  async cancelAndClose() {
    await this.clickCancel()
    await this.verifyModalIsNotVisible()
  }
}
